import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { ActivationToken } from "../entity/ActivationToken";
import { send404, send409, send500, send401, send410 } from "../utils/http-error-responses";
import { ISignupRequest, ILoginRequest, IEditRequest } from "../schema/users";
import { createToken } from "../utils/activation-tokens";
import logger from "logger";
import { getTokenPayload } from "../auth/auth";
import uuid from "uuid/v4";
import messaging from "../service/messaging";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const userRepository = getRepository(User);
    const users = await userRepository.createQueryBuilder("user").getMany();

    const response = {
      count: users.length,
      users: users.map((doc) => {
        return {
          id: doc.id,
          surname: doc.surname,
          forename: doc.forename,
          email: doc.email,
          createdAt: doc.created,
          updatedAt: doc.updated,
          request: {
            type: "GET",
            url: `/users/${doc.id}`
          }
        }
      }),
    };

    res.locals.body = response;
    res.status(200).json(response);
    return next();
  } catch (err) {
    const message = "Unexpected error when getting all users";
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

export async function signup(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const { email, forename, surname, password, phone }: ISignupRequest = req.body;
    const userRepository = getRepository(User);

    const [user,] = await userRepository.find({ email });
    if (user) {
      send409(res, { message: "User already created", target: `/users/${user.id}` })
      return next();
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);
    const newUser: User = {
      uuid: uuid(),
      forename,
      email,
      phone,
      password: hashedPassword,
      activated: false,
      optInMarketing: false,
    };

    const { token, expires } = createToken();
    const activationToken: ActivationToken = {
      token,
      expires,
      user: newUser,
      isUsed: false,
    };
    newUser.activationTokens = [activationToken];

    const result = await userRepository.save(newUser);
    newUser.activationTokens = [];
    messaging.signalSignup(newUser, token, expires, correlationId);

    const response = {
      message: "User created successfully.",
      user: {
        id: result.id,
        created: result.created
      },
      request: {
        type: "GET",
        url: `/users/${result.id}`
      }
    };

    res.status(201).json(response);
    next();
  } catch (err) {
    const message = "Unexpected error when creating user";
    logger.error({
      message,
      data: req.body,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const { userData } = res.locals;
    if (!userData) {
      send401(res, { message: "Unauthorised operation" });
      return next();
    }

    const user = await getRepository(User).findOneOrFail({ uuid: userData.uuid });
    const response = {
      message: "User found.",
      user: {
        id: user.id,
        forename: user.forename,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        created: user.created,
        updated: user.updated
      },
      request: {
        type: "GET",
        url: `/users/`
      }
    };

    res.locals.body = response;
    res.status(200).json(response);
    next();
  } catch (err) {
    const message = "Error getting user (me)";
    logger.error({
      message,
      data: req.body,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  const { email, password }: ILoginRequest = req.body;
  try {
    const [user,] = await getRepository(User).find({ email });
    if (!user) {
      send401(res, { message: "Sorry that didn't work, please try again." });
      return next();
    }

    const passwordCompare = await compare(password, user.password);

    if (!passwordCompare) {
      send401(res, { message: "Sorry that didn't work, please try again." });
      return next();
    }
    const tokenPayload = getTokenPayload(user);
    const token = sign(tokenPayload, process.env.JWT_USERS_KEY || "");

    res.locals.body = { id: user.id, token }
    res.status(200).json({
      id: user.id,
      token,
      message: "Authentication successful."
    });
    next();
  } catch (err) {
    const message = "Unexpected error when logging in user";
    logger.error({
      message,
      data: req.body,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  const { id } = req.params;
  try {
    const [user,] = await getRepository(User).find({ id: Number(id) });
    if (!user) {
      send404(res, { message: "User not found" });
      return next();
    }

    const response = {
      message: "User found.",
      user: {
        id: user.id,
        forename: user.forename,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        created: user.created,
        updated: user.updated
      },
      request: {
        type: "GET",
        url: `/users/`
      }
    };

    res.locals.body = response;
    res.status(200).json(response);
    next();
  } catch (err) {
    const message = "Error getting user";
    logger.error({
      message,
      data: req.params,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const { id } = req.params;
    const { forename, surname, phone, optInMarketing, email }: IEditRequest = req.body;
    const user = await getRepository(User).findOne({ id: Number(id) });

    if (!user) {
      send404(res, { message: "User not found" });
      return next();
    }

    if (user.email !== email) {
      send401(res, { message: "Unauthorised operation" });
      return next();
    }
    user.forename = forename || user.forename;
    user.surname = surname || user.surname;
    user.phone = phone || user.phone;
    user.optInMarketing = optInMarketing || user.optInMarketing;

    const result = await getRepository(User).save(user);
    const response = {
      message: "User updated successfully.",
      user: {
        id: result.id,
        updated: result.updated
      },
      request: {
        type: "GET",
        url: `/users/${result.id}`
      }
    };

    res.status(200).json(response);
    next();
  } catch (err) {
    const message = "Error editing user";
    logger.error({
      message,
      data: req.body,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function del(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  const { id } = req.params;
  try {
    const user = await getRepository(User).findOne({ id: Number(id) });
    if (!user) {
      send404(res, { message: "User not found" });
      return next();
    }

    await getRepository(User).delete({ id: Number(id) });

    res.locals.body = { id: user.id };
    res.status(200).json({
      message: "User succesfully deleted.",
      id: user.id,
    });
    next();
  } catch (err) {
    const message = "Unexpected error when deleting user";
    logger.error({
      message,
      data: req.params,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function activate(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const { token } = req.params;
    const t = await getRepository(ActivationToken).findOne({ where: { token }, relations: ["user"] });

    if (!t) {
      send404(res, { message: "Token not found" });
      return next();
    }
    if (t.expires < new Date()) {
      send410(res, { message: "Activation token expired" });
      return next();
    }
    if (t.isUsed) {
      send410(res, { message: "Activation token already used" });
      return next();
    }

    const user = t.user;

    user.activated = true;
    t.isUsed = true;
    await getRepository(ActivationToken).save(t);
    await getRepository(User).save(user);

    res.locals.body = { id: t.user.id };
    res.status(200).json({
      message: "User succesfully activated.",
      id: t.user.id,
      request: {
        type: "GET",
        url: `/user/${t.user.id}`
      }
    });
    next();
  } catch (err) {
    const message = "Unexpected error when activating user";
    logger.error({
      message,
      data: req.params,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function sendPasswordToken(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const { email } = req.body;
    const user = await getRepository(User).findOne({ email });
    if (!user) {
      send404(res, { message: "User not found" });
      return next();
    }

    const { token, expires } = createToken();
    const passwordToken: ActivationToken = {
      token,
      expires,
      user,
      isUsed: false,
    };
    user.activationTokens?.push(passwordToken);
    await getRepository(User).save(user);
    user.activationTokens = [];
    messaging.signalPasswordResetToken(user, token, expires, correlationId);
    res.status(200).json({
      message: "Forgotten password token sent.",
    });
    next();
  } catch (err) {
    const message = "Unexpected error when getting token to reset password";
    logger.error({
      message,
      data: req.body,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function checkPasswordToken(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const { token } = req.params;
    const t = await getRepository(ActivationToken).findOne({ where: { token }, relations: ["user"] });
    if (!t) {
      send404(res, { message: "Activation Token not found" });
      return next();
    }

    if (t.expires < new Date()) {
      send410(res, { message: "Activation token expired" });
      return next();
    }
    if (t.isUsed) {
      send410(res, { message: "Activation token already used" });
      return next();
    }

    res.header("token", t.token);
    res.redirect(200, process.env.FORGOTTEN_PASSWORD_URL || "");
    next();
  } catch (err) {
    const message = "Unexpected error when getting token to reset password";
    logger.error({
      message,
      data: req.params,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const { password, token } = req.body;
    const t = await getRepository(ActivationToken).findOne({ where: { token }, relations: ["user"] });

    if (!t) {
      send404(res, { message: "Activation Token not found" });
      return next();
    }

    if (t.expires < new Date()) {
      send410(res, { message: "Activation token expired" });
      return next();
    }
    if (t.isUsed) {
      send410(res, { message: "Activation token already used" });
      return next();
    }

    t.isUsed = true;
    await getRepository(ActivationToken).save(t);
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const user = t.user;

    user.password = hashedPassword;
    await getRepository(User).save(user);
    res.status(200).json({
      message: "Password succesfully updated",
    });
    next();
  } catch (err) {
    const message = "Failed to reset the password";
    logger.error({
      message,
      data: req.params,
      error: err,
      correlationId,
    });
    send500(res, { message }, err);
    next();
  }
}