import { z } from "zod";

/** Shared query params for field selection (use in getQueryParams / getQueriesParams). */
export const selectQueryParams = z.object({
  select: z.union([z.string(), z.array(z.string())]).optional(),
  selects: z.union([z.string(), z.array(z.string())]).optional(),
});

/** Shared query params for list pagination (use in getQueriesParams only). */
export const paginationQueryParams = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .optional(),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .optional(),
});

/** Shared query params for list filtering/sorting (filter, sort, queryArray, queryArrayType). */
export const listQueryParams = z.object({
  filter: z.string().optional(),
  sort: z.union([z.string(), z.record(z.any())]).optional(),
  queryArray: z
    .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
    .optional(),
  queryArrayType: z
    .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
    .optional(),
});

export type SelectQueryParams = z.infer<typeof selectQueryParams>;
export type PaginationQueryParams = z.infer<typeof paginationQueryParams>;
export type ListQueryParams = z.infer<typeof listQueryParams>;
