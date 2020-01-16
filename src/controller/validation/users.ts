import { getfirstParam } from "../../utils/utils";
import { signupSchema, loginSchema, sendPasswordTokenSchema, editSchema } from "../../schema/users";
import { Request } from "express";

export async function validateUserRequest(req: Request): Promise<boolean> {
  const { method } = req;
  if (method === "DELETE") {
    const id = getfirstParam(req.path);
    if (!Number(id)) {
      throw new Error();
    }
    return true;
  }

  if (method === "POST") {
    if (req.path === "/users/signup") {
      await signupSchema.validate(req.body);
      return true;
    }
    if (req.path === "/users/login") {
      await loginSchema.validate(req.body);
      return true;
    }
    if (req.path === "/users/password-token") {
      await sendPasswordTokenSchema.validate(req.body);
      return true;
    }
  }

  if (method === "PATCH") {
    await editSchema.validate(req.body);
    const id = getfirstParam(req.path);
    if (!Number(id)) {
      throw new Error();
    }
    return true;
  }
  if (method === "GET") return true;
  return false;
}