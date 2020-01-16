import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { send401 } from "../utils/http-error-responses";
import { User } from "../entity/User";
import { Admin } from "../entity/Admin";
import { getRepository } from "typeorm";
import { APIService } from "../entity/APIService";

export function userAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("No token found in the headers");
    }
    const decoded = verify(token, "USER");
    res.locals.userData = decoded;
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
    res.locals.userData = decoded;
    next();
  } catch (error) {
    send401(res, { message: "Unauthorized operation" });
  }
}

export async function apiAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.get("X-TOKEN-AUTH") || "";
    if (!token) {
      throw new Error("No token found in the headers");
    }
    const api = await getRepository(APIService).findOneOrFail({token});
    api.lastUsed = new Date();
    await getRepository(APIService).save(api);
    res.locals.apiData = api;
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

export function getTokenPayload(user: User | Admin) {
  if (user instanceof User) {
    return {
      uuid: user.uuid,
    };
  }
  if (user instanceof Admin) {
    return {
      id: user.id,
      email: user.email,
    };
  }
  return "";
}
