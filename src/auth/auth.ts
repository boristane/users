import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { send401 } from "../utils/http-error-responses";

export function userAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("No token found in the headers");
    }
    const decoded = verify(token, "USER");
    Object.assign(req, { userData: decoded });
    next();
  } catch (error) {
    send401(res, { message: "Unauthorized operation" });
  }
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("No token found in the headers");
    }
    const decoded = verify(token, "ADMIN");
    Object.assign(req, { userData: decoded });
    next();
  } catch (error) {
    send401(res, { message: "Unauthorized operation" });
  }
}

export function verify(token: string, type: string) {
  let key = "";
  switch (type) {
    case "USER": {
      key = process.env.JWT_USERS_KEY || "";
      break;
    }
    case "ADMIN": {
      key = process.env.JWT_ADMINS_KEY || "";
      break;
    }
  }

  if (token.length === 0) {
    throw new Error("Houston we have a problem.");
  }
  return jwt.verify(token, key);
}
