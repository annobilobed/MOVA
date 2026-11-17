export type SeatLayout = (string | null)[][];

/**
 * Default coach layout from the source spec: rows of 2 + aisle + 2, then a back row of 5.
 * For 49 seats this gives 11 rows of four and a back row of five.
 */
export function defaultLayout(capacity: number): SeatLayout {
  const rows: SeatLayout = [];
  let n = 1;
  const backRow = capacity >= 9 ? 5 : 0;
  const front = capacity - backRow;
  const fullRows = Math.floor(front / 4);
  for (let r = 0; r < fullRows; r++) {
    rows.push([String(n++), String(n++), null, String(n++), String(n++)]);
  }
  const rest = front - fullRows * 4;
  if (rest > 0) {
    const row: (string | null)[] = [null, null, null, null, null];
    const slots = [0, 1, 3, 4];
    for (let i = 0; i < rest; i++) row[slots[i]] = String(n++);
    rows.push(row);
  }
  if (backRow) rows.push(Array.from({ length: 5 }, () => String(n++)));
  return rows;
}

export const layoutSeats = (layout: SeatLayout) => layout.flat().filter((s): s is string => s !== null);
