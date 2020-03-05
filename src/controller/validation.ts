import { Request, Response, NextFunction } from "express";
import logger from "logger";
import { send400 } from "../utils/http-error-responses";
import { validateUserRequest } from "./validation/users";
import { validateAdminRequest } from "./validation/admins";
import { validateApiServiceRequest } from "./validation/apiService";
import { validateInternalRequest } from "./validation/internal";

export async function validateRequest(req: Request, res: Response, next: NextFunction) {
  const { path } = req;
  const [, baseUrl,] = path.split("/")
  let validated = false;
  try {
    if (`/${baseUrl}` === "/users") {
      validated = await validateUserRequest(req);
    } else if (`/${baseUrl}` === "/admins") {
      validated = await validateAdminRequest(req);
    } else if (`/${baseUrl}` === "/api-services") {
      validated = await validateApiServiceRequest(req);
    } else if (`/${baseUrl}` === "/internal") {
      validated = await validateInternalRequest(req);
    }
    if (validated) { return next(); }

    logger.error("Unknown request", {
      body: req.body,
      query: req.query,
      method: req.method,
      path,
      baseUrl,
    });
    return next();
  } catch (err) {
    logger.error("Failed validating a request", {
      url: req.url,
      body: req.body,
      query: req.query,
      method: req.method,
      error: err,
    });
    send400(res, { message: "Bad request, does not match schema", target: err.errors }, err);
  }
}






