import { z } from "zod";
import { listQueryParams, paginationQueryParams, selectQueryParams } from "./queryParamsZod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const EventValidationSchemas = {
  getQueryParams: selectQueryParams,
  getQueriesParams: selectQueryParams.merge(paginationQueryParams).merge(listQueryParams),
  idParam: z.object({
    id: z.string().regex(objectIdRegex, "ID must be a valid 24-character ObjectId"),
  }),
  createEvent: z.object({
    title: z.string().trim().min(2).max(150),
    description: z.string().trim().max(500).optional(),
    ministryId: z.string().regex(objectIdRegex, "ministryId must be a valid ObjectId").optional(),
    eventDate: z.union([z.string().trim().datetime(), z.date()]).transform((value) => new Date(value)),
    location: z.string().trim().max(200).optional(),
    attendeeLimit: z.number().int().min(1).optional(),
    attendanceCount: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
    createdByUserId: z.string().regex(objectIdRegex, "createdByUserId must be a valid ObjectId").optional(),
  }),
  updateEvent: z
    .object({
      title: z.string().trim().min(2).max(150).optional(),
      description: z.string().trim().max(500).optional(),
      ministryId: z.string().regex(objectIdRegex, "ministryId must be a valid ObjectId").optional(),
      eventDate: z.union([z.string().trim().datetime(), z.date()]).transform((value) => new Date(value)).optional(),
      location: z.string().trim().max(200).optional(),
      attendeeLimit: z.number().int().min(1).optional(),
      attendanceCount: z.number().int().min(0).optional(),
      isPublished: z.boolean().optional(),
      createdByUserId: z.string().regex(objectIdRegex, "createdByUserId must be a valid ObjectId").optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required for update",
    }),
};

export type CreateEventDTO = z.infer<typeof EventValidationSchemas.createEvent>;
export type UpdateEventDTO = z.infer<typeof EventValidationSchemas.updateEvent>;
export type GetEventQueryDTO = z.infer<typeof EventValidationSchemas.getQueryParams>;
export type GetEventsQueryDTO = z.infer<typeof EventValidationSchemas.getQueriesParams>;
