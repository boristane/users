import express from "express";
import {
  getUser, getUserEmail,
} from "../controller/internal";

const router = express.Router();

router.get("/users/:uuid", getUser);
router.get("/users/email/:uuid", getUserEmail);

export default router;