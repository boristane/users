import express from "express";
import {
  getAll,
  signup,
  login,
  getOne,
  del,
  activate
} from "../controller/users";
import { userAuth, adminAuth } from "../auth/auth";

const router = express.Router();

router.get("/", getAll);
router.post("/signup", signup);
router.post("/login", login);
router.get("/:id", getOne);
router.delete("/", adminAuth, del);
router.get("/activate/:token", activate);

export default router;
