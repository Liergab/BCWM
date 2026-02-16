import parseFilterString from "./parseFilterString";

export interface ListQueryParams {
  filter?: string;
  sort?: unknown;
  queryArray?: string | number | (string | number)[];
  queryArrayType?: string | number | (string | number)[];
}

/**
 * Apply shared list query params (filter, sort, queryArray, queryArrayType) to a where object.
 * Returns { where, orderBy } so list endpoints can use the same filtering/sorting.
 */
export function applyListQueryParams(
  where: Record<string, unknown> = {},
  params: ListQueryParams = {}
): { where: Record<string, unknown>; orderBy?: unknown } {
  const result = { ...where } as Record<string, unknown>;

  // queryArray + queryArrayType → where[field] = { in: queryArray }
  const queryArray = Array.isArray(params.queryArray)
    ? params.queryArray
    : params.queryArray !== undefined
      ? [params.queryArray]
      : [];
  const queryArrayType = Array.isArray(params.queryArrayType)
    ? params.queryArrayType
    : params.queryArrayType !== undefined
      ? [params.queryArrayType]
      : [];

  if (queryArray.length > 0 && queryArrayType.length > 0) {
    queryArrayType.forEach((type: string | number) => {
      const key = String(type).trim();
      (result as Record<string, unknown>)[key] = { in: queryArray };
    });
  }

  // filter string → merge parsed where
  if (params.filter && typeof params.filter === "string") {
    const parsed = parseFilterString(params.filter);
    if (parsed) {
      Object.assign(result, parsed);
    }
  }

  // sort → orderBy (support JSON string or object)
  let orderBy: unknown;
  if (params.sort != null) {
    if (typeof params.sort === "string") {
      try {
        orderBy = JSON.parse(params.sort);
      } catch {
        orderBy = params.sort;
      }
    } else {
      orderBy = params.sort;
    }
  }

  return orderBy != null ? { where: result, orderBy } : { where: result };
}
