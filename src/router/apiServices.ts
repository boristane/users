import express from "express";
import {
  getAll,
  update,
  create,
} from "../controller/apiServices";

const router = express.Router();

router.get("/", getAll);
router.post("/", create);
router.patch("/:id", update);

export default router;