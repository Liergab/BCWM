import { z } from "zod";
import { listQueryParams, paginationQueryParams, selectQueryParams } from "./queryParamsZod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const MinistryValidationSchemas = {
  getQueryParams: selectQueryParams,
  getQueriesParams: selectQueryParams.merge(paginationQueryParams).merge(listQueryParams),
  idParam: z.object({
    id: z.string().regex(objectIdRegex, "ID must be a valid 24-character ObjectId"),
  }),
  createMinistry: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).optional(),
    isActive: z.boolean().optional(),
    leaderUserId: z.string().regex(objectIdRegex, "leaderUserId must be a valid ObjectId").optional(),
    scheduleDay: z.string().trim().max(30).optional(),
    scheduleTime: z.string().trim().max(20).optional(),
  }),
  updateMinistry: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      description: z.string().trim().max(500).optional(),
      isActive: z.boolean().optional(),
      leaderUserId: z.string().regex(objectIdRegex, "leaderUserId must be a valid ObjectId").optional(),
      scheduleDay: z.string().trim().max(30).optional(),
      scheduleTime: z.string().trim().max(20).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required for update",
    }),
};

export type CreateMinistryDTO = z.infer<typeof MinistryValidationSchemas.createMinistry>;
export type UpdateMinistryDTO = z.infer<typeof MinistryValidationSchemas.updateMinistry>;
export type GetMinistryQueryDTO = z.infer<typeof MinistryValidationSchemas.getQueryParams>;
export type GetMinistriesQueryDTO = z.infer<typeof MinistryValidationSchemas.getQueriesParams>;
