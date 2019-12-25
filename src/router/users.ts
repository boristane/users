import express from "express";
import {
  getAll,
  signup,
  login,
  getOne,
  del,
  activate,
  edit,
  sendPasswordToken,
} from "../controller/users";
import { userAuth, adminAuth } from "../auth/auth";

const router = express.Router();

router.get("/", adminAuth, getAll);
router.get("/:id", userAuth, getOne);
router.get("/activate/:token", activate);
router.post("/password-token", sendPasswordToken);
router.post("/signup", signup);
router.post("/login", login);
router.patch("/:id", userAuth, edit);
router.delete("/:id", adminAuth, del);

export default router;
