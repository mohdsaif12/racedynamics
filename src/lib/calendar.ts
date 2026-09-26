/**
 * Plain YYYY-MM-DD calendar maths — no Date timezone surprises, because
 * appointments.appt_date is a Postgres `date` with no time attached.
 * "Today" is always the showroom's day (Asia/Kolkata), not the server's.
 */

export type DayCell = { iso: string; day: number; inMonth: boolean };

const pad = (n: number) => String(n).padStart(2, "0");

export function todayIST(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** "2026-09" → { year: 2026, month: 8 } (month is 0-based). Falls back to fallbackIso's month. */
export function parseMonth(value: string | undefined, fallbackIso: string) {
  const m = value?.match(/^(\d{4})-(\d{2})$/);
  const year = m ? Number(m[1]) : Number(fallbackIso.slice(0, 4));
  const month = m ? Number(m[2]) - 1 : Number(fallbackIso.slice(5, 7)) - 1;
  if (month < 0 || month > 11) return parseMonth(undefined, fallbackIso);
  return { year, month };
}

export function monthKey(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Six Monday-first weeks covering the month, padded with neighbouring days. */
export function monthGrid(year: number, month: number): DayCell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday = 0
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(Date.UTC(year, month, 1 - offset + i));
    cells.push({
      iso: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month,
    });
  }
  return cells;
}

/** "2026-09-26" → "Sat, 26 Sep 2026" */
export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
