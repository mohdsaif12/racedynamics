/**
 * PostgREST returns at most 1000 rows per request no matter what you ask
 * for, and it doesn't error past that — it just stops. With 1,200+
 * accessories that silently hid the last ~200 from both the public page and
 * the admin list. This pages through with .range() until a short page comes
 * back. `page` must apply a stable order, or rows can repeat/skip between
 * pages.
 */
const PAGE = 1000;

export async function selectAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[] | null> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error || !data) return from === 0 ? null : rows;
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}
