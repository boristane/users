import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import logger = require("logger");
import { send404, send500, send401 } from "../utils/http-error-responses";
import { APIService } from "../entity/APIService";
import moment = require("moment");
import { Membership } from "../entity/Membership";
import { MembershipTier } from "../utils/utils";

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const api = res.locals.apiData as APIService;
    if (!api.isActive) {
      send401(res, { message: "Unauthorized operation" });
      return next();
    }
    const { uuid } = req.params;
    const user = await getRepository(User).findOne({ uuid });
    if (!user) {
      send404(res, { message: "User not found" });
      return next();
    }

    const response = {
      message: "User found.",
      user: {
        uuid: user.uuid,
      },
      request: {
        type: "GET",
        url: `/internal/users/`
      }
    };
    api.lastUsed = new Date();
    await getRepository(APIService).save(api);
    res.locals.body = response;
    res.status(200).json(response);
    next();
  } catch (err) {
    const message = "Unexpected error when getting user";
    logger.error(message, { data: req.body, error: err, })
    send500(res, { message }, err);
    return next();
  }
}

export async function makePremium(req: Request, res: Response, next: NextFunction) {
  try {
    const api = res.locals.apiData as APIService;
    if (!api.isActive) {
      send401(res, { message: "Unauthorized operation" });
      return next();
    }
    const { uuid } = req.params;
    const user = await getRepository(User).findOne({ uuid }, { relations: ["memberships"] });
    if (!user) {
      send404(res, { message: "User not found" });
      return next();
    }

    const membership: Membership = {
      tier: MembershipTier.premium,
      expirationDate: moment(new Date()).add(3, "month").toDate(),
      startDate: new Date(),
      isActive: true,
    }
    user.memberships.forEach(m => m.isActive = false);
    user.memberships.push(membership);
    await getRepository(User).save(user);

    const response = {
      message: "Membership updated.",
      user: {
        uuid: user.uuid,
      },
      request: {
        type: "GET",
        url: `/internal/users/`
      }
    };
    api.lastUsed = new Date();
    await getRepository(APIService).save(api);
    res.locals.body = response;
    res.status(200).json(response);
    next();
  } catch (err) {
    const message = "Unexpected error when getting user";
    logger.error(message, { data: req.body, error: err, })
    send500(res, { message }, err);
    return next();
  }
}

export async function getUserEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const api = res.locals.apiData as APIService;
    if (api.name !== "email-service" || !api.isActive) {
      send401(res, { message: "Unauthorized operation" });
      return next();
    }
    const { uuid } = req.params;
    const user = await getRepository(User).findOne({ uuid });
    if (!user) {
      send404(res, { message: "User not found" });
      return next();
    }

    const response = {
      message: "User found.",
      user: {
        email: user.email,
      },
      request: {
        type: "GET",
        url: `/internal/users/`
      }
    };
    api.lastUsed = new Date();
    await getRepository(APIService).save(api);
    res.locals.body = response;
    res.status(200).json(response);
    next();
  } catch (err) {
    const message = "Unexpected error when getting user";
    logger.error(message, { data: req.body, error: err, })
    send500(res, { message }, err);
    return next();
  }
}
