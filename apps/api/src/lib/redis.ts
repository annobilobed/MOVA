import { Redis } from "ioredis";
import { config } from "./config.js";

export const redis = new Redis(config.redisUrl, { maxRetriesPerRequest: 2 });

const lockKey = (tripId: string, seat: string) => `mova:lock:${tripId}:${seat}`;
const userLockKey = (tripId: string, userId: string) => `mova:userlock:${tripId}:${userId}`;

export interface SeatLock {
  seat: string;
  userId: string;
  expiresAt: string;
}

export const HOLD_LIMITS = { maxActiveTrips: 2, maxNewHoldsPerTripPerHour: 4, paymentGraceSeconds: 300 } as const;

export type LockFailure = "held_by_other" | "too_many_trips" | "too_many_holds";

/**
 * Lock a seat for a user. A user holds at most one seat per trip: taking a new seat
 * releases the previous one. Holds are never extended by re-selecting (no endless holds),
 * a user may hold seats on at most 2 trips at once, and may start at most 4 holds per trip per hour.
 */
export async function lockSeat(tripId: string, seat: string, userId: string): Promise<SeatLock | { error: LockFailure }> {
  const ttl = config.seatLockSeconds;
  const key = lockKey(tripId, seat);
  const holder = await redis.get(key);
  if (holder && holder !== userId) return { error: "held_by_other" };
  if (holder === userId) {
    const pttl = await redis.pttl(key);
    return { seat, userId, expiresAt: new Date(Date.now() + Math.max(pttl, 0)).toISOString() };
  }
  const previous = await redis.get(userLockKey(tripId, userId));
  if (!previous) {
    let active = 0;
    let cursor = "0";
    do {
      const [next, keys] = await redis.scan(cursor, "MATCH", `mova:userlock:*:${userId}`, "COUNT", 200);
      cursor = next;
      active += keys.length;
    } while (cursor !== "0");
    if (active >= HOLD_LIMITS.maxActiveTrips) return { error: "too_many_trips" };
  }
  const countKey = `mova:holdcount:${tripId}:${userId}`;
  const count = await redis.incr(countKey);
  if (count === 1) await redis.expire(countKey, 3600);
  if (count > HOLD_LIMITS.maxNewHoldsPerTripPerHour) return { error: "too_many_holds" };
  const ok = await redis.set(key, userId, "EX", ttl, "NX");
  if (!ok) return { error: "held_by_other" };
  if (previous && previous !== seat) {
    const prevHolder = await redis.get(lockKey(tripId, previous));
    if (prevHolder === userId) await redis.del(lockKey(tripId, previous));
  }
  await redis.set(userLockKey(tripId, userId), seat, "EX", ttl);
  return { seat, userId, expiresAt: new Date(Date.now() + ttl * 1000).toISOString() };
}

/**
 * Mobile money approvals can be slow: when a payment starts with little hold time left,
 * extend the hold once to 5 minutes. Never more than once per hold.
 */
export async function graceForPayment(tripId: string, seat: string, userId: string): Promise<string | null> {
  const key = lockKey(tripId, seat);
  if ((await redis.get(key)) !== userId) return null;
  const pttl = await redis.pttl(key);
  const grace = HOLD_LIMITS.paymentGraceSeconds * 1000;
  if (pttl < grace) {
    const flag = `mova:grace:${tripId}:${seat}:${userId}`;
    if (await redis.set(flag, "1", "EX", HOLD_LIMITS.paymentGraceSeconds + 60, "NX")) {
      await redis.pexpire(key, grace);
      await redis.pexpire(userLockKey(tripId, userId), grace);
      return new Date(Date.now() + grace).toISOString();
    }
  }
  return new Date(Date.now() + Math.max(pttl, 0)).toISOString();
}

export async function getSeatLock(tripId: string, seat: string): Promise<SeatLock | null> {
  const key = lockKey(tripId, seat);
  const [holder, pttl] = await Promise.all([redis.get(key), redis.pttl(key)]);
  if (!holder || pttl <= 0) return null;
  return { seat, userId: holder, expiresAt: new Date(Date.now() + pttl).toISOString() };
}

export async function releaseSeat(tripId: string, seat: string, userId: string) {
  const key = lockKey(tripId, seat);
  if ((await redis.get(key)) === userId) await redis.del(key);
  if ((await redis.get(userLockKey(tripId, userId))) === seat) await redis.del(userLockKey(tripId, userId));
}

/** All currently locked seats on a trip, with their holders. */
export async function tripLocks(tripId: string): Promise<Map<string, string>> {
  const prefix = `mova:lock:${tripId}:`;
  const result = new Map<string, string>();
  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 200);
    cursor = next;
    if (keys.length) {
      const values = await redis.mget(...keys);
      keys.forEach((k, i) => {
        if (values[i]) result.set(k.slice(prefix.length), values[i]!);
      });
    }
  } while (cursor !== "0");
  return result;
}
