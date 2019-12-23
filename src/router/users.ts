import express from "express";
import {
  getAll,
  signup,
  login,
  getOne,
  del,
  activate,
  edit
} from "../controller/users";
import { userAuth, adminAuth } from "../auth/auth";

const router = express.Router();

router.get("/", adminAuth, getAll);
router.get("/:id", userAuth, getOne);
router.get("/activate/:token", activate);
router.post("/signup", signup);
router.post("/login", login);
router.patch("/", userAuth, edit);
router.delete("/", adminAuth, del);

export default router;
