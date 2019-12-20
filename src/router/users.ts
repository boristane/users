import express from "express";
import {
  getAll,
  signup,
  login,
  getOne,
  del,
  activate
} from "../controller/users";
import { auth } from "../auth/auth";

const router = express.Router();

router.get("/", getAll);
router.post("/signup", signup);
router.post("/login", login);
router.get("/:id", getOne);
router.delete("/", auth, del);
router.get("/activate/:token", activate);

export default router;
