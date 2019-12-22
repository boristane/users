import express, { Request, Response, NextFunction } from "express";
import logger from "logger";
import uuid from "uuid/v4";
import * as _ from "lodash";
import router from "./router/users";
import { validateRequest } from "./controller/validation";

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
        body: _.omit(req.body, ommitedInLogs),
        query: req.query,
        method: req.method,
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
app.use("/users/", router);
app.use(responseLogger);
