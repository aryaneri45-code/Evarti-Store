import express from "express";
import * as categoryController from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", categoryController.index);
router.get("/:slug", categoryController.show);

export default router;