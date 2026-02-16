import { z } from "zod";
import { listQueryParams, paginationQueryParams, selectQueryParams } from "./queryParamsZod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const ledgerTypeSchema = z.preprocess((input) => {
  if (typeof input !== "string") return input;
  return input.trim().toUpperCase();
}, z.enum(["OPENING_BALANCE", "TITHE", "OFFERING", "DONATION", "EXPENSE", "REVERSAL"]));

const paymentModeSchema = z.preprocess((input) => {
  if (typeof input !== "string") return input;
  return input.trim().toUpperCase();
}, z.enum(["CASH", "BANK", "MOBILE"]));

export const LedgerEntryValidationSchemas = {
  idParam: z.object({
    id: z.string().regex(objectIdRegex, "ID must be a valid 24-character ObjectId"),
  }),
  createLedgerEntry: z.object({
    entryDate: z.union([z.string().trim().datetime(), z.date()]).transform((value) => new Date(value)).optional(),
    type: ledgerTypeSchema,
    amount: z.number().positive("amount must be greater than 0"),
    serviceName: z.string().trim().max(120).optional(),
    paymentMode: paymentModeSchema,
    note: z.string().trim().max(500).optional(),
  }),
  createReversal: z.object({
    note: z.string().trim().max(500).optional(),
  }),
  getQueryParams: selectQueryParams,
  getQueriesParams: selectQueryParams
    .merge(paginationQueryParams)
    .merge(listQueryParams)
    .extend({
      type: ledgerTypeSchema.optional(),
      paymentMode: paymentModeSchema.optional(),
      from: z.string().trim().datetime().optional(),
      to: z.string().trim().datetime().optional(),
      serviceName: z.string().trim().optional(),
    }),
  getAllQuery: z.object({
    type: ledgerTypeSchema.optional(),
    paymentMode: paymentModeSchema.optional(),
    from: z.string().trim().datetime().optional(),
    to: z.string().trim().datetime().optional(),
    serviceName: z.string().trim().optional(),
  }),
};

export type CreateLedgerEntryDTO = z.infer<typeof LedgerEntryValidationSchemas.createLedgerEntry>;
export type CreateLedgerReversalDTO = z.infer<typeof LedgerEntryValidationSchemas.createReversal>;
export type GetLedgerEntriesQueryDTO = z.infer<typeof LedgerEntryValidationSchemas.getAllQuery>;
export type GetLedgerEntryQueryDTO = z.infer<typeof LedgerEntryValidationSchemas.getQueryParams>;
export type GetLedgerEntriesQueryParamsDTO = z.infer<typeof LedgerEntryValidationSchemas.getQueriesParams>;
