import { NextFunction, RequestHandler, Response } from "express";

type Role = "user" | "admin" | "super";

export function authorize(roles: Array<Role> = ["user"]): RequestHandler {
  return (req: any, res: Response, next: NextFunction) => {
    if (
      roles.includes(req.user.role) &&
      req.user.tenant_names.includes(req.connectionKey)
    ) {
      return next();
    }

    return res.status(401).json({ message: "Unauthorized Access" });
  };
}

export function authorizeWithNoTenant(roles: Array<Role> = ["user"]): RequestHandler {
  return (req: any, res: Response, next: NextFunction) => {
    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(401).json({ message: "Unauthorized Access" });
  };
}
