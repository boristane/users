import { getRepository } from "typeorm";
import { Request, Response, NextFunction } from "express";
import { send500, send409, send404 } from "../utils/http-error-responses";
import logger from "logger";
import { APIService } from "../entity/APIService";
import { IApiServiceCreateRequest, IApiServiceUpdateRequest } from "../schema/apiService";
import moment from "moment";
import { hash } from "bcryptjs";
import { generateRandomAlphaNumString } from "../utils/tokens";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const services = await getRepository(APIService).createQueryBuilder("apiService").getMany();

    const response = {
      count: services.length,
      services: services.map((doc) => {
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
    logger.error(message, { data: req.body, error: err, });
    send500(res, { message }, err);
    return next();
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, expires }: IApiServiceCreateRequest = req.body;
    const [service,] = await getRepository(APIService).find({ name });
    if (service) {
      send409(res, { message: "API Service already created", target: `/api-services` })
      return next();
    }

    const saltRounds = 10;
    const s = generateRandomAlphaNumString(16);
    const token = await hash(s, saltRounds);

    const newService: APIService = {
      name,
      expires: moment(expires).toDate(),
      token,
    };

    const result = await getRepository(APIService).save(newService);
    res.status(201).json({
      message: "API Service created successfully.",
      service: {
        id: result.id,
        created: result.created
      },
      request: {
        type: "GET",
        url: `/api-services`
      }
    });
  } catch (err) {
    const message = "Unexpected error when creating API Service";
    logger.error(message, { data: req.body, error: err, });
    send500(res, { message }, err);
    next();
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { active }: IApiServiceUpdateRequest = req.body;
    const [service,] = await getRepository(APIService).find({ id: Number(id) });
    if (!service) {
      send404(res, { message: "API Service not found", target: `/api-services` })
      return next();
    }

    service.isActive = active;

    const result = await getRepository(APIService).save(service);
    res.status(200).json({
      message: "API Service updated.",
      service: {
        id: result.id,
        active: result.isActive
      },
      request: {
        type: "GET",
        url: `/api-services`
      }
    });
  } catch (err) {
    const message = "Unexpected error when updating API Service";
    logger.error(message, { data: req.body, error: err, })
    send500(res, { message }, err);
    next();
  }
}
