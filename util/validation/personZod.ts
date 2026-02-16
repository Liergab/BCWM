import { z } from 'zod'
import { listQueryParams, paginationQueryParams, selectQueryParams } from './queryParamsZod'

const objectIdRegex = /^[a-fA-F0-9]{24}$/

const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    barangay: z.string().trim().optional(),
    city: z.string().trim().optional(),
    municipality: z.string().trim().optional(),
    province: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
  })
  .optional()

export const PersonValidationSchemas = {
  getQueryParams: selectQueryParams,
  getQueriesParams: selectQueryParams.merge(paginationQueryParams).merge(listQueryParams),
  idParam: z.object({
    id: z
      .string()
      .regex(objectIdRegex, 'ID must be a valid 24-character ObjectId'),
  }),
  createPerson: z.object({
    firstName: z
      .string({ required_error: 'First name is required' })
      .trim()
      .min(2, 'First name must be at least 2 characters')
      .max(100, 'First name must be at most 100 characters'),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .trim()
      .min(2, 'Last name must be at least 2 characters')
      .max(100, 'Last name must be at most 100 characters'),
    description: z.string().trim().optional(),
    birthday: z
      .union([z.string().trim().datetime(), z.date()])
      .transform((val) => new Date(val))
      .optional(),
    age: z.number().int().min(0).max(130).optional(),
    phoneNumber: z.string().trim().min(7).max(20).optional(),
    address: addressSchema,
  }),
  updatePerson: z
    .object({
      firstName: z.string().trim().min(2).max(100).optional(),
      lastName: z.string().trim().min(2).max(100).optional(),
      description: z.string().trim().optional(),
      birthday: z
        .union([z.string().trim().datetime(), z.date()])
        .transform((val) => new Date(val))
        .optional(),
      age: z.number().int().min(0).max(130).optional(),
      phoneNumber: z.string().trim().min(7).max(20).optional(),
      address: addressSchema,
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required for update',
    }),
}

export type CreatePersonDTO = z.infer<typeof PersonValidationSchemas.createPerson>
export type UpdatePersonDTO = z.infer<typeof PersonValidationSchemas.updatePerson>
export type GetPersonQueryDTO = z.infer<typeof PersonValidationSchemas.getQueryParams>
export type GetPersonsQueryDTO = z.infer<typeof PersonValidationSchemas.getQueriesParams>
