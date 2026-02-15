import type { RequestHandler } from "express";
import { storage } from "../storage";
import type { UserRole } from "@shared/permissions";
import { hasPermission, type Permission } from "@shared/permissions";

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;
    if (!req.isAuthenticated?.() || !user?.claims?.sub) {
      return res.status(401).json({ error: "Please sign in" });
    }

    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser) {
      return res.status(401).json({ error: "Please sign in" });
    }

    if (!allowedRoles.includes(dbUser.role)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    (req as any).dbUser = dbUser;
    next();
  };
};

export const requirePermission = (permission: Permission): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;
    if (!req.isAuthenticated?.() || !user?.claims?.sub) {
      return res.status(401).json({ error: "Please sign in" });
    }

    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser) {
      return res.status(401).json({ error: "Please sign in" });
    }

    if (!hasPermission(dbUser.role, permission)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    (req as any).dbUser = dbUser;
    next();
  };
};

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const user = req.user as any;
  if (req.isAuthenticated?.() && user?.claims?.sub) {
    const dbUser = await storage.getUser(user.claims.sub);
    if (dbUser) {
      (req as any).dbUser = dbUser;
    }
  }
  next();
};
