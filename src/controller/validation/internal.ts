import { Request } from "express";

export async function validateInternalRequest(req: Request): Promise<boolean> {
  const { method } = req;
  if (method === "GET") return true;
  return false;
}