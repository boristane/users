import { getRepository, getConnection } from "typeorm";
import { Admin } from "../entity/Admin";
import { Request, Response, NextFunction } from "express";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { send404, send500, send401, send409 } from "../utils/http-error-responses";
import { ILoginRequest } from "../schema/users";
import logger from "logger";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  const correlationId = res.get("x-correlation-id") || "";
  try {
    const adminRepository = getRepository(Admin);
    const admins = await adminRepository.createQueryBuilder("admin").getMany();

    if (admins.length === 0) {
      send404(res, { message: "No Admin found with in the database" });
      return next();
    }

    const response = {
      count: admins.length,
      admins: admins.map((doc) => {
        return {
          id: doc.id,
          email: doc.email,
          isSuperAdmin: doc.isSuperAdmin,
          username: doc.username,
          createdAt: doc.created,
          updatedAt: doc.updated,
          request: {
            type: "GET",
            url: `/admins/${doc.id}`
          }
        }
      }),
    };

    res.locals.body = response;
    res.status(200).json(response);
    return next();
  } catch (err) {
    const message = "Unexpected error when getting all admins";
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
  const correlationId = res.get("x-correlation-id") || "";
  try {

    const { email, username, password, isSuperAdmin, superAdmin: superAdminEmail } = req.body;
    const superAdmin = await getRepository(Admin).findOneOrFail({ email: superAdminEmail });
  
    if (!superAdmin.isSuperAdmin) {
      send401(res, { message: "Unauthorised operation" });
      return next();
    }
  
    const [admin,] = await getRepository(Admin).find({ email });
    if (admin) {
      send409(res, { message: "Admin already created", target: `/admins/${admin.id}` })
      return next();
    }
  
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);
  
    const newAdmin: Admin = {
      email,
      username,
      isSuperAdmin,
      password: hashedPassword,
      created: new Date(),
      updated: new Date(),
    };
  
    const result = await getRepository(Admin).save(newAdmin);
    res.status(200).json({
      message: "Admin created successfully.",
      user: {
        id: result.id,
        created: result.created
      },
      request: {
        type: "GET",
        url: `/admins/${result.id}`
      }
    });
  } catch (err) {
    const message = "Unexpected error when creating admin";
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
    const [admin,] = await getRepository(Admin).find({ email });
    if (!admin) {
      send401(res, { message: "Unauthorised operation" });
      return next();
    }

    const passwordCompare = await compare(password, admin.password);

    if (!passwordCompare) {
      send401(res, { message: "Unauthorised operation" });
      return next();
    }
    const token = sign(admin.email, process.env.JWT_ADMINS_KEY || "");

    res.locals.body = { id: admin.id, token }
    res.status(200).json({
      id: admin.id,
      token,
      message: "Authentication successful."
    });
    next();
  } catch (err) {
    const message = "Unexpected error when logging in admin";
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
  const { email, admin: adminEmail } = req.body;
  try {
    const admin = await getRepository(Admin).findOne({ email });
    if (!admin) {
      send404(res, { message: "Admin not found" });
      return next();
    }

    const superAdmin = await getRepository(Admin).findOneOrFail({ email: adminEmail });
    if (!superAdmin?.isSuperAdmin) {
      send401(res, { message: "Unauthorised operation" });
      return next();
    }

    await getRepository(Admin).delete({ email });

    res.locals.body = { id: admin.id };
    res.status(200).json({
      message: "Admin succesfully deleted.",
      id: admin.id,
    });
    next();
  } catch (err) {
    const message = "Unexpected error when deleting admin";
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
