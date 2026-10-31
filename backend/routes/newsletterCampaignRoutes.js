import express from "express";

import {
  createNewsletterCampaign,
  startNewsletterCampaign,
  sendNewsletterCampaignBatch,
  getNewsletterCampaigns,
  getNewsletterCampaignDetails,
} from "../controllers/newsletterCampaignController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.post("/create", createNewsletterCampaign);

router.post("/:id/start", startNewsletterCampaign);

router.post("/:id/send-batch", sendNewsletterCampaignBatch);

router.get("/admin", getNewsletterCampaigns);

router.get("/admin/:id", getNewsletterCampaignDetails);

export default router;