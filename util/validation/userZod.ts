import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    barangay: z.string().trim().optional(),
    city: z.string().trim().optional(),
    municipality: z.string().trim().optional(),
    province: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
  })
  .optional();

const personSchema = z.object({
  name: z
    .string({ required_error: "Person name is required" })
    .trim()
    .min(2, "Person name must be at least 2 characters")
    .max(100, "Person name must be at most 100 characters"),
  description: z.string().trim().optional(),
  address: addressSchema,
});

export const ValidationSchemas = {
  idParam: z.object({
    id: z
      .string()
      .regex(objectIdRegex, "ID must be a valid 24-character ObjectId"),
  }),

  createUser: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .optional(),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Email must be a valid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
    address: addressSchema,
    person: personSchema.optional(),
  }).refine((value) => Boolean(value.person || value.name), {
    message: "Name is required when person is not provided",
    path: ["name"],
  }),

  login: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Email must be a valid email address"),
    password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
  }),

  updateUser: z
    .object({
      email: z.string().trim().email().optional(),
      password: z.string().min(8).optional(),
      person: personSchema.partial().optional(),
      isVerified: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required for update",
    }),

  getQueryParams: z.object({
    select: z.union([z.string(), z.array(z.string())]).optional(),
  }),

  getQueriesParams: z.object({
    filter: z.string().optional(),
    include: z.record(z.any()).optional(),
    select: z.union([z.string(), z.array(z.string())]).optional(),
    sort: z.union([z.string(), z.record(z.any())]).optional(),
    queryArray: z
      .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
      .optional(),
    queryArrayType: z
      .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
      .optional(),
    page: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
    limit: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
  }),

  searchQuery: z.object({
    search: z.string().trim().min(1).max(100),
  }),
};

export type IdParamType = z.infer<typeof ValidationSchemas.idParam>;
export type CreateUserDTO = z.infer<typeof ValidationSchemas.createUser>;
export type LoginDTO = z.infer<typeof ValidationSchemas.login>;
export type UpdateUserDTO = z.infer<typeof ValidationSchemas.updateUser>;
export type GetUserQueryDTO = z.infer<typeof ValidationSchemas.getQueryParams>;
export type GetUsersQueryDTO = z.infer<typeof ValidationSchemas.getQueriesParams>;
export type SearchUsersQueryDTO = z.infer<typeof ValidationSchemas.searchQuery>;
