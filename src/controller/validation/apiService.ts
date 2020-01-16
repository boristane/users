import { Request } from "express";
import { getfirstParam } from "../../utils/utils";
import { apiServiceCreateSchema, apiServiceUpdateSchema } from "../../schema/apiService";

export async function validateApiServiceRequest(req: Request): Promise<boolean> {
  const { method } = req;
  if (method === "DELETE") {
    const id = getfirstParam(req.path);
    if (!Number(id)) {
      throw new Error();
    }
    return true;
  }

  if (method === "POST") {
    await apiServiceCreateSchema.validate(req.body);
    return true;
  }

  if (method === "PATCH") {
    await apiServiceUpdateSchema.validate(req.body);
    const id = getfirstParam(req.path);
    if (!Number(id)) {
      throw new Error();
    }
    return true;
  }

  if (method === "GET") return true;
  return false;
}