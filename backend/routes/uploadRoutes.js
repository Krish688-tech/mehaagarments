import express from "express";

import {
  generateUploadSignature,
} from "../controllers/uploadController.js";

import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get(
  "/signature",
  protect,
  generateUploadSignature
);

export default router;