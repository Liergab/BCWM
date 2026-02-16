import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const userRoleValues = ["SUPER_ADMIN", "FINANCE_OFFICER", "PASTOR", "MINISTRY_LEADER", "MEMBER"] as const;
const userStatusValues = ["ACTIVE", "INACTIVE"] as const;
const humanReadableRoles = ["Super Admin", "Finance Officer", "Pastor", "Ministry Leader", "Member"] as const;
const humanReadableStatuses = ["active", "inactive"] as const;
const userRoleSchema = z.preprocess((input) => {
  if (typeof input !== "string") return input;
  return input.trim().toUpperCase().replace(/\s+/g, "_");
}, z.enum(userRoleValues, {
  errorMap: () => ({
    message: `Role must be one of: ${humanReadableRoles.join(", ")}`,
  }),
}));
const userStatusSchema = z.preprocess((input) => {
  if (typeof input !== "string") return input;
  return input.trim().toUpperCase();
}, z.enum(userStatusValues, {
  errorMap: () => ({
    message: `Status must be one of: ${humanReadableStatuses.join(", ")}`,
  }),
}));

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
  firstName: z
    .string({ required_error: "Person first name is required" })
    .trim()
    .min(2, "Person first name must be at least 2 characters")
    .max(100, "Person first name must be at most 100 characters"),
  lastName: z
    .string({ required_error: "Person last name is required" })
    .trim()
    .min(2, "Person last name must be at least 2 characters")
    .max(100, "Person last name must be at most 100 characters"),
  description: z.string().trim().optional(),
  birthday: z
    .union([z.string().trim().datetime(), z.date()])
    .transform((val) => new Date(val))
    .optional(),
  age: z.number().int().min(0).max(130).optional(),
  phoneNumber: z.string().trim().min(7).max(20).optional(),
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
    role: userRoleSchema.optional(),
    status: userStatusSchema.optional(),
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

  verifyEmail: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Email must be a valid email address"),
    verificationCode: z
      .string({ required_error: "Verification code is required" })
      .trim()
      .regex(/^\d{4}$/, "Verification code must be a 4-digit code"),
  }),

  updateUser: z
    .object({
      email: z.string().trim().email().optional(),
      password: z.string().min(8).optional(),
      person: personSchema.partial().optional(),
      isVerified: z.boolean().optional(),
      role: userRoleSchema.optional(),
      status: userStatusSchema.optional(),
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
export type VerifyEmailDTO = z.infer<typeof ValidationSchemas.verifyEmail>;
export type UpdateUserDTO = z.infer<typeof ValidationSchemas.updateUser>;
export type GetUserQueryDTO = z.infer<typeof ValidationSchemas.getQueryParams>;
export type GetUsersQueryDTO = z.infer<typeof ValidationSchemas.getQueriesParams>;
export type SearchUsersQueryDTO = z.infer<typeof ValidationSchemas.searchQuery>;
