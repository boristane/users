import express from "express";
import {
  getAll,
  create,
  login,
  del,
} from "../controller/admins";
import { adminAuth } from "../auth/auth";

const router = express.Router();

router.get("/", adminAuth, getAll);
router.post("/", adminAuth, create);
router.post("/login", login);
router.delete("/", adminAuth, del);

export default router;
