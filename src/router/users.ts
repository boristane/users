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
  checkPasswordToken,
  resetPassword,
  getMe
} from "../controller/users";
import { userAuth, adminAuth } from "../auth/auth";

const router = express.Router();

router.get("/", adminAuth, getAll);
router.get("/me/all", userAuth, getMe);
router.get("/:id", adminAuth, getOne);
router.get("/activate/:token", activate);
router.post("/password-token", sendPasswordToken);
router.get("/password-token/:token", checkPasswordToken);
router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.patch("/:id", userAuth, edit);
router.delete("/:id", adminAuth, del);

export default router;
