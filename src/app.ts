import express, { Request, Response, NextFunction } from "express";
import logger from "logger";
import uuid from "uuid/v4";
import usersRouter from "./router/users";
import adminsRouter from "./router/admins";
import apiServicesRouter from "./router/apiServices";
import { validateRequest } from "./controller/validation";
import { adminAuth } from "./auth/auth";

const suppressLoggingPaths = ["/"];
const ommitedInLogs = [
  "forename",
  "surname",
  "email",
  "password",
];
function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!suppressLoggingPaths.includes(req.url)) {
    const correlationId: string = req.header("x-correlation-id") || uuid();
    logger.info({
      message: "REQUEST",
      data: {
        url: req.url,
        body: req.body,
        query: req.query,
        method: req.method,
        token: req.headers.authorization,
      },
      correlationId,
    });
    res.set("x-correlation-id", correlationId);
  }
  next();
}

function responseLogger(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!suppressLoggingPaths.includes(req.url)) {
    logger.info({
      message: "RESPONSE",
      data: {
        statusCode: res.statusCode,
        locals: res.locals,
        url: req.url,
      },
      correlationId: res.get("x-correlation-id"),
    });
  }
  next();
}

export const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(validateRequest);
app.use("/users/", usersRouter);
app.use("/admins/", adminsRouter);
app.use("/api-services/", adminAuth, apiServicesRouter);
app.use(responseLogger);
