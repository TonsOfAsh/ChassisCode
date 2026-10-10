/**
 * Daily puzzle calendar. Shared by the server (which picks the car) and the
 * browser (which shows the countdown), so both agree on when a day starts.
 *
 * A new daily puzzle starts at midnight Pacific time (America/Los_Angeles:
 * PST in winter, PDT in summer), for every player wherever they are.
 */

export const DAILY_TIME_ZONE = 'America/Los_Angeles';

/** The first daily puzzle. Its number is 1. */
export const DAILY_EPOCH = '2027-01-01';

const dateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: DAILY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** The Pacific calendar date at `now`, as YYYY-MM-DD. */
export function dailyDate(now: Date = new Date()): string {
  return dateFormat.format(now);
}

const DAY_MS = 86_400_000;

function utcDay(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y!, m! - 1, d!) / DAY_MS;
}

/** Puzzle number for a date: 1 on DAILY_EPOCH, counting up by one per day. */
export function dailyNumber(date: string): number {
  return utcDay(date) - utcDay(DAILY_EPOCH) + 1;
}

/** The date one day after `date`. */
export function nextDate(date: string, days = 1): string {
  return new Date((utcDay(date) + days) * DAY_MS).toISOString().slice(0, 10);
}

/** True if `value` is a YYYY-MM-DD date. */
export function isDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Milliseconds until the next daily puzzle starts. */
export function msUntilNextDaily(now: Date = new Date()): number {
  const tomorrow = nextDate(dailyDate(now));
  const [y, m, d] = tomorrow.split('-').map(Number);
  // Pacific midnight is 07:00 or 08:00 UTC depending on daylight saving; take the one that is midnight there.
  for (const hours of [7, 8]) {
    const candidate = new Date(Date.UTC(y!, m! - 1, d!, hours));
    if (dailyDate(candidate) === tomorrow && dailyDate(new Date(candidate.getTime() - 1)) !== tomorrow) {
      return Math.max(0, candidate.getTime() - now.getTime());
    }
  }
  return DAY_MS - (now.getTime() % DAY_MS); // not reached; a safe fallback
}
