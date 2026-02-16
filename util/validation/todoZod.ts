import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const TodoValidationSchemas = {
  idParam: z.object({
    id: z
      .string()
      .regex(objectIdRegex, "ID must be a valid 24-character ObjectId"),
  }),

  createTodo: z.object({
    name: z
      .string({
        required_error: "name is required",
        invalid_type_error: "name must be a string",
      })
      .trim()
      .min(1, "name is required"),
    description: z
      .string({
        required_error: "description is required",
        invalid_type_error: "description must be a string",
      })
      .trim()
      .min(1, "description is required"),
  }),

  updateTodo: z
    .object({
      name: z.string().trim().min(1, "name cannot be empty").optional(),
      description: z
        .string()
        .trim()
        .min(1, "description cannot be empty")
        .optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required for update",
    }),
};

export type CreateTodoDTO = z.infer<typeof TodoValidationSchemas.createTodo>;
export type UpdateTodoDTO = z.infer<typeof TodoValidationSchemas.updateTodo>;
