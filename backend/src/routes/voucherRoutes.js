import express from "express";
import * as voucherController from "../controllers/voucherController.js";

const router = express.Router();

router.post("/validate", voucherController.validate);

export default router;
