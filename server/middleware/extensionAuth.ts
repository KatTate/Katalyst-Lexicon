import type { RequestHandler } from "express";
import { storage } from "../storage";
import { hasPermission, type Permission } from "@shared/permissions";

const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "katgroupinc.com";

function isExtensionRequest(req: any): boolean {
  return !!(req.headers['x-extension-user-email'] && req.headers['x-extension-secret']);
}

async function resolveExtensionUser(req: any, res: any): Promise<any | null> {
  const email = req.headers['x-extension-user-email'] as string;
  const secret = req.headers['x-extension-secret'] as string;
  const extensionId = req.headers['x-extension-id'] as string;
  const expectedSecret = process.env.EXTENSION_API_SECRET;
  const allowedExtId = process.env.ALLOWED_EXTENSION_ID;

  if (allowedExtId && extensionId && extensionId !== allowedExtId) {
    res.status(403).json({ error: "Unrecognized extension" });
    return null;
  }

  if (!expectedSecret || secret !== expectedSecret) {
    res.status(403).json({ error: "Invalid extension secret" });
    return null;
  }

  const domain = email.split('@')[1];
  if (!domain || domain.toLowerCase() !== ALLOWED_EMAIL_DOMAIN.toLowerCase()) {
    res.status(403).json({ error: `Email domain must be @${ALLOWED_EMAIL_DOMAIN}` });
    return null;
  }

  let dbUser = await storage.getUserByEmail(email);
  if (!dbUser) {
    dbUser = await storage.createUser({
      email,
      firstName: email.split('@')[0],
      role: "Member",
    });
  }

  return dbUser;
}

export const requireAuthOrExtension = (permission: Permission): RequestHandler => {
  return async (req: any, res, next) => {
    if (req.isAuthenticated?.() && (req.user as any)?.claims?.sub) {
      const dbUser = await storage.getUser((req.user as any).claims.sub);
      if (dbUser) {
        if (!hasPermission(dbUser.role, permission)) {
          return res.status(403).json({ error: "Permission denied" });
        }
        req.dbUser = dbUser;
        return next();
      }
    }

    if (isExtensionRequest(req)) {
      const dbUser = await resolveExtensionUser(req, res);
      if (!dbUser) return;
      if (!hasPermission(dbUser.role, permission)) {
        return res.status(403).json({ error: "Permission denied" });
      }
      req.dbUser = dbUser;
      return next();
    }

    return res.status(401).json({ error: "Please sign in" });
  };
};

export const extensionOrSessionAuth: RequestHandler = async (req: any, res, next) => {
  if (req.isAuthenticated?.() && (req.user as any)?.claims?.sub) {
    const dbUser = await storage.getUser((req.user as any).claims.sub);
    if (dbUser) {
      req.dbUser = dbUser;
      return next();
    }
  }

  if (isExtensionRequest(req)) {
    const dbUser = await resolveExtensionUser(req, res);
    if (!dbUser) return;
    req.dbUser = dbUser;
    return next();
  }

  return res.status(401).json({ error: "Please sign in" });
};

export const sessionOrExtensionRead: RequestHandler = async (req: any, res, next) => {
  if (req.isAuthenticated?.() && (req.user as any)?.claims?.sub) {
    return next();
  }

  if (isExtensionRequest(req)) {
    const dbUser = await resolveExtensionUser(req, res);
    if (!dbUser) return;
    req.dbUser = dbUser;
    return next();
  }

  return res.status(401).json({ error: "Please sign in" });
};
