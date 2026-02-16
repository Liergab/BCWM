import { NextFunction, Request, Response } from "express";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not Authorized, No user context" });
      return;
    }

    const userRole = (req.user as any).role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: insufficient permissions" });
      return;
    }

    next();
  };
};
