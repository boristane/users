import express from "express";
import {
  getUser,
} from "../controller/internal";

const router = express.Router();

router.get("/users/:uuid", getUser);

export default router;