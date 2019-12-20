import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { send401 } from "../utils/http-error-responses";

export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("No token found in the headers");
    }
    const decoded = verify(token);
    Object.assign(req, { userData: decoded });
    next();
  } catch (error) {
    send401(res, { message: "Unauthorized operation" });
  }
}

export function verify(token: string) {
  return jwt.verify(token, process.env.JWT_KEY || "");
}
