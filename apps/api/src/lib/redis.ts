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

/**
 * Lock a seat for a user. A user holds at most one seat per trip: taking a new seat
 * releases the previous one. Returns null if another user holds the seat.
 */
export async function lockSeat(tripId: string, seat: string, userId: string): Promise<SeatLock | null> {
  const ttl = config.seatLockSeconds;
  const key = lockKey(tripId, seat);
  const ok = await redis.set(key, userId, "EX", ttl, "NX");
  if (!ok) {
    const holder = await redis.get(key);
    if (holder !== userId) return null;
    await redis.expire(key, ttl); // refresh own hold
  }
  const previous = await redis.get(userLockKey(tripId, userId));
  if (previous && previous !== seat) {
    const prevHolder = await redis.get(lockKey(tripId, previous));
    if (prevHolder === userId) await redis.del(lockKey(tripId, previous));
  }
  await redis.set(userLockKey(tripId, userId), seat, "EX", ttl);
  const pttl = await redis.pttl(key);
  return { seat, userId, expiresAt: new Date(Date.now() + Math.max(pttl, 0)).toISOString() };
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
