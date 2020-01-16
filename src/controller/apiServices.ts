import { getRepository } from "typeorm";
import { Request, Response, NextFunction } from "express";
import { send500 } from "../utils/http-error-responses";
import logger from "logger";
import { APIService } from "../entity/APIService";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const services = await getRepository(APIService).createQueryBuilder("apiService").getMany();

    const response = {
      count: services.length,
      users: services.map((doc) => {
        return {
          id: doc.id,
          name: doc.name,
          isActive: doc.isActive,
          expires: doc.expires,
          createdAt: doc.created,
          updatedAt: doc.updated,
          lastUsed: doc.lastUsed,
        }
      }),
    };

    res.locals.body = response;
    res.status(200).json(response);
    return next();
  } catch (err) {
    const message = "Unexpected error when getting all api services";
    logger.error({
      message,
      data: req.body,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    return next();
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {

}

export async function del(req: Request, res: Response, next: NextFunction) {

}

export async function edit(req: Request, res: Response, next: NextFunction) {

}