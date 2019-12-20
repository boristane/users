import { Response } from "express";

const httpErrors = {
  noneFound: "NONE_FOUND",
  alreadyCreated: "ALREADY_CREATED",
  internalServerError: "INTERNAL_SERVER_ERROR",
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  gone: "GONE",
}

export interface IHTTPError {
  message: string;
  target?: string;
}

export function send401(res: Response, error: IHTTPError) {
  res.status(401).json(Object.assign(error, { code: httpErrors.unauthorized }));
}

export function send403(res: Response, error: IHTTPError) {
  res.status(403).json(Object.assign(error, { code: httpErrors.forbidden }));
}

export function send404(res: Response, error: IHTTPError) {
  res.status(404).json(Object.assign(error, { code: httpErrors.noneFound }));
}

export function send409(res: Response, error: IHTTPError) {
  res.status(409).json(Object.assign(error, { code: httpErrors.alreadyCreated }));
}

export function send410(res: Response, error: IHTTPError) {
  res.status(410).json(Object.assign(error, { code: httpErrors.gone }));
}

export function send500(res: Response, error: IHTTPError, err?: any) {
  res.locals.body = err;
  res.status(500).json(Object.assign(error, { code: httpErrors.internalServerError }));
}
