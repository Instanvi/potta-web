/** Page through a paginated list API until all matching rows are collected. */

type PageResult<T> = {
  data?: T[];
  items?: T[];
  meta?: {
    totalItems?: number;
    total?: number;
    totalPages?: number;
    currentPage?: number;
    page?: number;
  };
};

export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<PageResult<T>>,
  limit = 100,
  maxPages = 50,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  while (page <= maxPages) {
    const result = await fetchPage(page, limit);
    const rows = result.data ?? result.items ?? [];
    all.push(...rows);
    const totalPages =
      result.meta?.totalPages ??
      (result.meta?.totalItems != null
        ? Math.ceil(result.meta.totalItems / limit)
        : result.meta?.total != null
          ? Math.ceil(result.meta.total / limit)
          : undefined);
    if (rows.length < limit) break;
    if (totalPages != null && page >= totalPages) break;
    page += 1;
  }
  return all;
}
