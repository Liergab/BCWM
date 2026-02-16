import { z } from "zod";
import { listQueryParams, paginationQueryParams, selectQueryParams } from "./queryParamsZod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const addressSchema = z.object({
  street: z.string().trim().optional(),
  barangay: z.string().trim().optional(),
  city: z.string().trim().optional(),
  municipality: z.string().trim().optional(),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
});

const themeSchema = z.object({
  primaryColor: z.string().trim().optional(),
  secondaryColor: z.string().trim().optional(),
  accentColor: z.string().trim().optional(),
  darkMode: z.boolean().optional(),
});

const serviceScheduleSchema = z.object({
  dayOfWeek: z.string().trim().min(2).max(20),
  serviceName: z.string().trim().min(2).max(100),
  serviceTime: z.string().trim().min(1).max(20),
  isRecurring: z.boolean().default(true),
  locationLabel: z.string().trim().optional(),
});

export const ChurchConfigValidationSchemas = {
  idParam: z.object({
    id: z.string().regex(objectIdRegex, "ID must be a valid 24-character ObjectId"),
  }),
  createChurchConfig: z.object({
    churchName: z.string().trim().min(2).max(150),
    shortName: z.string().trim().max(50).optional(),
    logoUrl: z.string().trim().url().optional(),
    denomination: z.string().trim().max(100).optional(),
    contactEmail: z.string().trim().email().optional(),
    contactPhone: z.string().trim().max(20).optional(),
    websiteUrl: z.string().trim().url().optional(),
    address: addressSchema.optional(),
    defaultTheme: themeSchema.optional(),
    serviceSchedules: z.array(serviceScheduleSchema).optional(),
  }),
  getQueryParams: selectQueryParams,
  getQueriesParams: selectQueryParams.merge(paginationQueryParams).merge(listQueryParams),
  updateChurchConfig: z
    .object({
      churchName: z.string().trim().min(2).max(150).optional(),
      shortName: z.string().trim().max(50).optional(),
      logoUrl: z.string().trim().url().optional(),
      denomination: z.string().trim().max(100).optional(),
      contactEmail: z.string().trim().email().optional(),
      contactPhone: z.string().trim().max(20).optional(),
      websiteUrl: z.string().trim().url().optional(),
      address: addressSchema.optional(),
      defaultTheme: themeSchema.optional(),
      serviceSchedules: z.array(serviceScheduleSchema).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required for update",
    }),
};

export type CreateChurchConfigDTO = z.infer<typeof ChurchConfigValidationSchemas.createChurchConfig>;
export type UpdateChurchConfigDTO = z.infer<typeof ChurchConfigValidationSchemas.updateChurchConfig>;
export type GetChurchConfigQueryDTO = z.infer<typeof ChurchConfigValidationSchemas.getQueryParams>;
export type GetChurchConfigsQueryDTO = z.infer<typeof ChurchConfigValidationSchemas.getQueriesParams>;
