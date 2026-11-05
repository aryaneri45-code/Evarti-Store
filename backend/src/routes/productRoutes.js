import express from "express";
import * as productController from "../controllers/productController.js";

const router = express.Router();

router.get("/", productController.index);
router.get("/:slug", productController.show);

export default router;