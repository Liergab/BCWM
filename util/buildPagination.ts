/**
 * Build pagination metadata from total count, page, and limit.
 */
export function buildPagination(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export type PaginationMeta = ReturnType<typeof buildPagination>;
