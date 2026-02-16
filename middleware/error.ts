import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import httpError from "../util/httpError";
import { ZodError } from "zod";

export const NotFoundEndpoint = (req:Request ,res:Response,next:NextFunction) => {
    const error = new Error(`Not found Endpoint- ${req.originalUrl}`)
    res.status(404)
    next(error)
}

export const errorValidation: ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

    if (err instanceof ZodError) {
        res.status(httpError.VALIDATION_ERROR).json({
            title: "Validation Failed",
            message: "Request validation failed",
            errors: err.errors.map((issue) => ({
                field: issue.path.join(".") || "body",
                message: issue.message,
            })),
        });
        return;
    }

    if (err instanceof Error) {
        switch (statusCode) {
            case httpError.VALIDATION_ERROR:
                res.json({ title: "Validation Failed", message: err.message });
                break;
            case httpError.NOT_FOUND:
                res.json({ title: "Not found", message: err.message });
                break;
            case httpError.FORBIDDEN:
                res.json({ title: "Forbidden", message: err.message });
                break;
            case httpError.UNAUTHORIZED:
                res.json({ title: "Unauthorized", message: err.message });
                break;
            case httpError.SERVER_ERROR:
                res.json({ title: "Server Error", message: err.message });
                break;
            case httpError.CONFLICT:
                res.json({ title: "Conflict", message: err.message });
                break;
            default:
                res.status(statusCode).json({ title: "Error", message: err.message });
                break;
        }
    } else {
        res.status(500).json({ title: "Internal Server Error", message: "Unexpected error occurred" });
    }
};