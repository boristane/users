import { getRepository, getConnection } from "typeorm";
import { User } from "../entity/User";
import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { ActivationToken } from "../entity/ActivationToken";
import { send404, send409, send500, send401, send410 } from "../utils/http-error-responses";
import { ISignupRequest, ILoginRequest } from "../schema/users";
import { createToken, sendTokenEmail } from "../utils/activation-tokens";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userRepository = getRepository(User);
    const users = await userRepository.createQueryBuilder("user").getMany();

    if (users.length === 0) {
      send404(res, { message: "No User found with in the database" });
      return next();
    }

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

    res.status(200).json(response);
    return next();
  } catch (err) {
    send500(res, { message: "Unexpected error when getting all users" });
    return next();
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const correlationId = res.get("x-correlation-id");
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
      forename,
      surname,
      email,
      phone,
      password: hashedPassword,
      activated: false,
    };

    const { token, expires } = createToken();
    const activationToken: ActivationToken = {
      token,
      expires,
      user: newUser,
    };
    newUser.activationTokens = [activationToken];

    const result = await userRepository.save(newUser);
    await sendTokenEmail(email, token, expires, correlationId);

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
  } catch (err) {
    send500(res, { message: "Unexpected error when creating user" });
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password }: ILoginRequest = req.body;
  try {
    const [user,] = await getRepository(User).find({ email });
    if (!user) {
      send404(res, { message: "No User found with in the database" });
      return next();
    }

    const passwordCompare = await compare(password, user.password);

    if (!passwordCompare) {
      send401(res,  { message: "Unauthorised operation" });
      return next();
    }
    const token = sign(user.email, process.env.JWT_KEY || "");

    res.status(200).json({
      id: user.id,
      token,
      message: "Authentication successful."
    });
  } catch (err) {
    send500(res, { message: "Unexpected error when logging in user" });
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    const [user,] = await getRepository(User).find({ id: Number(id) }); 
    if (!user) {
      send404(res, {message: "User not found"});
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

    res.status(200).json(response);
  } catch (err) {
    send500(res, err);
  }
}

export async function del(req: Request, res: Response, next: NextFunction) {
  const { email } = req.query;
  try {
    const user = await getRepository(User).findOne({email});
    if (!user) {
      send404(res, { message: "User not found" });
      return next();
    }

    await getRepository(User).delete({ email });

    res.status(200).json({
      message: "User succesfully deleted.",
      id: user.id,
    });
  } catch (err) {
    send500(res, { message: "Unexpected error when deleting user" });
  }
}



export async function activate(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const t = await getRepository(ActivationToken).findOne({token});

    if (!t) {
      send404(res, { message: "Token not found" });
      return next();
    }

    const user = t.user;

    if (t.expires < new Date()) {
      send410(res, {message: "Activation token expired"});
      return next();
    }

    await getRepository(User).save(user);

    return res.status(200).json({
      message: "User succesfully activated.",
      id: t.user.id,
      request: {
        type: "GET",
        url: `/user/${t.user.id}`
      }
    });
  } catch (err) {
    send500(res, { message: "Unexpected error when activating user" });
  }
}