import express from "express";
import {
  getAll,
  del,
  edit,
  create,
} from "../controller/apiServices";
import { adminAuth } from "../auth/auth";

const router = express.Router();

router.get("/", adminAuth, getAll);
router.post("/", adminAuth, create);
router.patch("/:id", adminAuth, edit);
router.delete("/:id", adminAuth, del);

export default router;