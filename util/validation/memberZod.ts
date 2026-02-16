import { z } from "zod";
import { listQueryParams, paginationQueryParams, selectQueryParams } from "./queryParamsZod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const memberStatusSchema = z.preprocess((input) => {
  if (typeof input !== "string") return input;
  return input.trim().toUpperCase();
}, z.enum(["ACTIVE", "INACTIVE", "VISITOR"]));

export const MemberValidationSchemas = {
  getQueryParams: selectQueryParams,
  getQueriesParams: selectQueryParams.merge(paginationQueryParams).merge(listQueryParams),
  idParam: z.object({
    id: z.string().regex(objectIdRegex, "ID must be a valid 24-character ObjectId"),
  }),
  createMember: z.object({
    memberCode: z.string().trim().min(3).max(30),
    personId: z.string().regex(objectIdRegex, "personId must be a valid ObjectId"),
    userId: z.string().regex(objectIdRegex, "userId must be a valid ObjectId").optional(),
    ministryId: z.string().regex(objectIdRegex, "ministryId must be a valid ObjectId").optional(),
    familyGroupCode: z.string().trim().max(50).optional(),
    membershipStatus: memberStatusSchema.optional(),
    membershipDate: z.union([z.string().trim().datetime(), z.date()]).transform((value) => new Date(value)).optional(),
    baptismDate: z.union([z.string().trim().datetime(), z.date()]).transform((value) => new Date(value)).optional(),
    attendanceCount: z.number().int().min(0).optional(),
    volunteerCount: z.number().int().min(0).optional(),
    notes: z.string().trim().optional(),
  }),
  updateMember: z
    .object({
      memberCode: z.string().trim().min(3).max(30).optional(),
      personId: z.string().regex(objectIdRegex, "personId must be a valid ObjectId").optional(),
      userId: z.string().regex(objectIdRegex, "userId must be a valid ObjectId").optional(),
      ministryId: z.string().regex(objectIdRegex, "ministryId must be a valid ObjectId").optional(),
      familyGroupCode: z.string().trim().max(50).optional(),
      membershipStatus: memberStatusSchema.optional(),
      membershipDate: z.union([z.string().trim().datetime(), z.date()]).transform((value) => new Date(value)).optional(),
      baptismDate: z.union([z.string().trim().datetime(), z.date()]).transform((value) => new Date(value)).optional(),
      attendanceCount: z.number().int().min(0).optional(),
      volunteerCount: z.number().int().min(0).optional(),
      notes: z.string().trim().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required for update",
    }),
};

export type CreateMemberDTO = z.infer<typeof MemberValidationSchemas.createMember>;
export type UpdateMemberDTO = z.infer<typeof MemberValidationSchemas.updateMember>;
export type GetMemberQueryDTO = z.infer<typeof MemberValidationSchemas.getQueryParams>;
export type GetMembersQueryDTO = z.infer<typeof MemberValidationSchemas.getQueriesParams>;
