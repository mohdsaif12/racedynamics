/**
 * How often cached public data refreshes on its own, in seconds.
 *
 * Keep this LONG. Every refresh re-renders and re-stores every page that uses
 * the data, and each of those is billed as Vercel ISR writes (~8 KB per unit;
 * /accessories alone is ~200 units). At 60 seconds, ordinary visitor and
 * crawler traffic drove 217k units in a month against the Hobby plan's 200k,
 * and the project was paused on 2026-10-15.
 *
 * Freshness doesn't come from this timer — every admin save invalidates the
 * affected pages immediately (src/app/admin/actions.ts). This is only a
 * safety net for edits made outside the admin, e.g. directly in Supabase.
 *
 * Note: the bike page's `export const revalidate` must be a literal, so it
 * repeats this value — change both together.
 */
export const REVALIDATE_SECONDS = 86_400; // 24 hours
