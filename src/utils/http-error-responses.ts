import { Response } from "express";

const httpErrors = {
  noneFound: "NONE_FOUND",
  alreadyCreated: "ALREADY_CREATED",
  internalServerError: "INTERNAL_SERVER_ERROR",
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  gone: "GONE",
  badRequest: "BAD_REQUEST",
}

export interface IHTTPError {
  message: string;
  target?: string;
}

export function send401(res: Response, error: IHTTPError) {
  const response = Object.assign(error, { code: httpErrors.unauthorized });
  res.locals.body = response;
  res.status(401).json(response);
}

export function send403(res: Response, error: IHTTPError) {
  const response = Object.assign(error, { code: httpErrors.forbidden });
  res.locals.body = response;
  res.status(403).json(response);
}

export function send404(res: Response, error: IHTTPError) {
  const response = Object.assign(error, { code: httpErrors.noneFound });
  res.locals.body = response;
  res.status(404).json(response);
}

export function send409(res: Response, error: IHTTPError) {
  const response = Object.assign(error, { code: httpErrors.alreadyCreated });
  res.locals.body = response;
  res.status(409).json(response);
}

export function send410(res: Response, error: IHTTPError) {
  const response = Object.assign(error, { code: httpErrors.gone });
  res.locals.body = response;
  res.status(410).json(response);
}

export function send500(res: Response, error: IHTTPError, err?: any) {
  const response = Object.assign(error, { code: httpErrors.internalServerError }, err);
  res.locals.body = response;
  res.status(500).json(response);
}

export function send400(res: Response, error: IHTTPError, err?: any) {
  const response = Object.assign(error, { code: httpErrors.badRequest }, err);
  res.locals.body = response;
  res.status(400).json(response);
}
