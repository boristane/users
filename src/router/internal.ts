import express from "express";
import {
  getUser, getUserEmail, makePremium,
} from "../controller/internal";

const router = express.Router();

router.get("/users/:uuid", getUser);
router.put("/users/make-premium/:uuid", makePremium);
router.get("/users/email/:uuid", getUserEmail);

export default router;