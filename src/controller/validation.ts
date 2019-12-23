import { Request, Response, NextFunction } from "express";
import logger from "logger";
import { send400 } from "../utils/http-error-responses";
import { signupSchema, loginSchema } from "../schema/users";
import { createSchema, deleteSchema } from "../schema/admin";

export async function validateRequest(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  const { path } = req;
  const [, baseUrl,] = path.split("/")
  let validated = false;
  try {
    if (`/${baseUrl}` === "/users") {
      validated = await validateUserRequest(req);
    } else if (`/${baseUrl}` === "/admins") {
      validated = await validateAdminRequest(req);
    }
    if (validated) { return next(); }

    logger.error({
      message: `Unknown request`,
      data: {
        body: req.body,
        query: req.query,
        method: req.method,
        path,
        baseUrl
      },
      correlationId,
    });
    return next();
  } catch (err) {
    logger.error({
      message: "Failed validating a request",
      data: {
        url: req.url,
        body: req.body,
        query: req.query,
        method: req.method,
      },
      error: err,
      correlationId,
    });
    send400(res, { message: "Bad request, does not match schema", target: err.errors }, err);
  }
}

async function validateUserRequest(req: Request): Promise<boolean> {
  const { method } = req;
  if (method === "DELETE") {
    const { email } = req.query;
    if (!email) {
      throw new Error();
    }
    return true;
  }

  if (method === "POST") {
    if (req.path === "/users/signup") {
      await signupSchema.validate(req.body);
      return true;
    }
    if (req.path === "/users/login") {
      await loginSchema.validate(req.body);
      return true;
    }
  }
  return false;
}

async function validateAdminRequest(req: Request): Promise<boolean> {
  const { method } = req;
  if (method === "DELETE") {
    await deleteSchema.validate(req.body);
    return true;
  }

  if (method === "POST") {
    if (req.path === "/admins") {
      await createSchema.validate(req.body);
      return true;
    }
    if (req.path === "/admins/login") {
      await loginSchema.validate(req.body);
      return true;
    }
  }
  return false;
}
