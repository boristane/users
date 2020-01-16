import { Request } from "express";
import { getfirstParam } from "../../utils/utils";
import { deleteSchema, createSchema } from "../../schema/admin";
import { loginSchema } from "../../schema/users";

export async function validateAdminRequest(req: Request): Promise<boolean> {
  const { method } = req;
  if (method === "DELETE") {
    const id = getfirstParam(req.path);
    if (!Number(id)) {
      throw new Error();
    }
    await deleteSchema.validate(req.body);
    return true;
  }

  if (method === "POST") {
    if (req.path === "/admins") {
      await createSchema.validate(req.body);
      return true;
    }
    if (req.path === "/admins/login") {
      await loginSchema.validate(req.body);
      return true;
    }
  }
  if (method === "GET") return true;
  return false;
}