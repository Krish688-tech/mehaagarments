import mongoose from "mongoose";

import NewsletterCampaign from "../models/newsletterCampaignModel.js";
import NewsletterCampaignRecipient from "../models/newsletterCampaignRecipientModel.js";
import NewsletterSubscriber from "../models/newsletterModel.js";

import { sendNewsletterEmail } from "../services/emailService.js";

// ==========================================
// CAMPAIGN VALIDATION
// ==========================================

const validateCampaign = (body) => {
  const requiredFields = ["campaignName", "subject", "heading", "message"];

  for (const field of requiredFields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return `${field} is required.`;
    }
  }

  if (body.campaignName.length > 120) {
    return "Campaign name must be under 120 characters.";
  }

  if (body.subject.length > 200) {
    return "Email subject must be under 200 characters.";
  }

  if (body.heading.length > 200) {
    return "Email heading must be under 200 characters.";
  }

  if (body.message.length > 10000) {
    return "Email message is too long.";
  }

  const urls = [body.bannerUrl, body.buttonUrl].filter(Boolean);

  for (const value of urls) {
    try {
      const url = new URL(value);

      if (!["http:", "https:"].includes(url.protocol)) {
        return "Only HTTP and HTTPS URLs are allowed.";
      }
    } catch {
      return "Please provide valid campaign URLs.";
    }
  }

  return null;
};

// ==========================================
// CREATE CAMPAIGN
// POST /api/newsletter-campaigns/create
// ADMIN ONLY
// ==========================================

export const createNewsletterCampaign = async (req, res) => {
  try {
    const validationError = validateCampaign(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const campaign = await NewsletterCampaign.create({
      campaignName: req.body.campaignName.trim(),
      subject: req.body.subject.trim(),
      previewText: String(req.body.previewText || "").trim(),
      bannerUrl: String(req.body.bannerUrl || "").trim(),
      heading: req.body.heading.trim(),
      message: req.body.message.trim(),
      buttonText: String(req.body.buttonText || "EXPLORE COLLECTION").trim(),
      buttonUrl: String(req.body.buttonUrl || "").trim(),
      createdBy: req.user._id,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Newsletter campaign saved successfully.",
      campaign,
    });
  } catch (error) {
    console.error("CREATE NEWSLETTER CAMPAIGN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create newsletter campaign.",
    });
  }
};

// ==========================================
// START CAMPAIGN
// POST /api/newsletter-campaigns/:id/start
// ADMIN ONLY
// ==========================================

export const startNewsletterCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID.",
      });
    }

    const campaign = await NewsletterCampaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    if (campaign.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft campaigns can be started.",
      });
    }

    const subscribers = await NewsletterSubscriber.find({
      isSubscribed: true,
      consent: true,
    })
      .select("_id email")
      .lean();

    if (!subscribers.length) {
      return res.status(400).json({
        success: false,
        message: "No eligible newsletter subscribers found.",
      });
    }

    const recipientRecords = subscribers.map((subscriber) => ({
      campaign: campaign._id,
      subscriber: subscriber._id,
      email: subscriber.email,
      status: "pending",
    }));

    await NewsletterCampaignRecipient.insertMany(recipientRecords, {
      ordered: false,
    });

    campaign.totalRecipients = subscribers.length;
    campaign.status = "sending";
    campaign.startedAt = new Date();

    await campaign.save();

    return res.status(200).json({
      success: true,
      message: "Campaign is ready for batch sending.",
      totalRecipients: subscribers.length,
      batchSize: 10,
      campaign,
    });
  } catch (error) {
    console.error("START NEWSLETTER CAMPAIGN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start newsletter campaign.",
    });
  }
};

// ==========================================
// SEND NEXT CAMPAIGN BATCH
// POST /api/newsletter-campaigns/:id/send-batch
// ADMIN ONLY
// ==========================================

export const sendNewsletterCampaignBatch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID.",
      });
    }

    const campaign = await NewsletterCampaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    if (campaign.status !== "sending") {
      return res.status(400).json({
        success: false,
        message: "This campaign is not currently sending.",
      });
    }

    const BATCH_SIZE = 10;

    // ==========================================
    // ATOMICALLY CLAIM RECIPIENTS
    // ==========================================

    const recipients = [];

    const staleProcessingTime = new Date(Date.now() - 15 * 60 * 1000);

    for (let i = 0; i < BATCH_SIZE; i++) {
      const recipient = await NewsletterCampaignRecipient.findOneAndUpdate(
        {
          campaign: campaign._id,
          attempts: { $lt: 3 },
          $or: [
            { status: "pending" },
            {
              status: "processing",
              processingAt: { $lt: staleProcessingTime },
            },
          ],
        },
        {
          $set: {
            status: "processing",
            processingAt: new Date(),
          },
          $inc: {
            attempts: 1,
          },
        },
        {
          new: true,
          sort: { createdAt: 1 },
        },
      );

      if (!recipient) break;

      recipients.push(recipient);
    }

    if (!recipients.length) {
      const [
        sentCount,
        failedCount,
        skippedCount,
        pendingCount,
        processingCount,
      ] = await Promise.all([
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "sent",
        }),
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "failed",
        }),
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "skipped",
        }),
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "pending",
        }),
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "processing",
        }),
      ]);

      campaign.sentCount = sentCount;
      campaign.failedCount = failedCount;

      const finished = pendingCount === 0 && processingCount === 0;

      if (finished) {
        campaign.status = failedCount > 0 ? "partially_completed" : "completed";

        campaign.completedAt = new Date();
      }

      await campaign.save();

      return res.status(200).json({
        success: true,
        message: finished
          ? "Campaign sending completed."
          : "Recipients are still pending or processing.",
        finished,
        campaign,
        progress: {
          total: campaign.totalRecipients,
          sent: sentCount,
          failed: failedCount,
          skipped: skippedCount,
          pending: pendingCount,
          processing: processingCount,
        },
      });
    }

    let batchSent = 0;
    let batchFailed = 0;
    let batchSkipped = 0;

    for (const recipient of recipients) {
      try {
        // Recheck consent immediately before sending.
        const subscriber = await NewsletterSubscriber.findOne({
          _id: recipient.subscriber,
          email: recipient.email,
          isSubscribed: true,
          consent: true,
        });

        if (!subscriber) {
          recipient.status = "skipped";
          recipient.error = "Subscriber is no longer eligible.";
          recipient.processingAt = null;
          await recipient.save();

          batchSkipped++;
          continue;
        }

        const result = await sendNewsletterEmail({
          subscriber,
          campaign,
        });

        if (!result?.sent) {
          recipient.status = "skipped";
          recipient.error = result?.reason || "Email was skipped.";
          recipient.processingAt = null;
          await recipient.save();

          batchSkipped++;
          continue;
        }

        recipient.status = "sent";
        recipient.messageId = result.messageId || null;
        recipient.sentAt = new Date();
        recipient.processingAt = null;
        recipient.failedAt = null;
        recipient.error = null;

        await recipient.save();

        batchSent++;
      } catch (error) {
        recipient.status = recipient.attempts >= 3 ? "failed" : "pending";
        recipient.processingAt = null;
        recipient.failedAt = new Date();
        recipient.error = error.message || "Email sending failed.";

        await recipient.save();

        if (recipient.status === "failed") {
          batchFailed++;
        }
      }
    }

    const [sentCount, failedCount, skippedCount, pendingCount] =
      await Promise.all([
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "sent",
        }),
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "failed",
        }),
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "skipped",
        }),
        NewsletterCampaignRecipient.countDocuments({
          campaign: campaign._id,
          status: "pending",
        }),
      ]);

    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;

    const processingCount = await NewsletterCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "processing",
    });

    if (pendingCount === 0 && processingCount === 0) {
      campaign.status = failedCount > 0 ? "partially_completed" : "completed";

      campaign.completedAt = new Date();
    }

    await campaign.save();

    const finished = pendingCount === 0 && processingCount === 0;

    return res.status(200).json({
      success: true,
      message: finished
        ? "Campaign sending completed."
        : "Campaign batch processed successfully.",
      finished,
      campaign: {
        _id: campaign._id,
        status: campaign.status,
        totalRecipients: campaign.totalRecipients,
        sentCount: campaign.sentCount,
        failedCount: campaign.failedCount,
      },
      batch: {
        sent: batchSent,
        failed: batchFailed,
        skipped: batchSkipped,
      },
      progress: {
        total: campaign.totalRecipients,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
        pending: pendingCount,
        processing: processingCount,
      },
    });
  } catch (error) {
    console.error("NEWSLETTER CAMPAIGN BATCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process campaign batch.",
    });
  }
};

// ==========================================
// GET CAMPAIGN HISTORY
// GET /api/newsletter-campaigns/admin
// ADMIN ONLY
// ==========================================

export const getNewsletterCampaigns = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );

    const [campaigns, total] = await Promise.all([
      NewsletterCampaign.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      NewsletterCampaign.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET NEWSLETTER CAMPAIGNS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch campaign history.",
    });
  }
};

// ==========================================
// GET CAMPAIGN DETAILS
// GET /api/newsletter-campaigns/admin/:id
// ADMIN ONLY
// ==========================================

export const getNewsletterCampaignDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID.",
      });
    }

    const campaign = await NewsletterCampaign.findById(id).lean();

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    const [sent, failed, pending, skipped] = await Promise.all([
      NewsletterCampaignRecipient.countDocuments({
        campaign: id,
        status: "sent",
      }),
      NewsletterCampaignRecipient.countDocuments({
        campaign: id,
        status: "failed",
      }),
      NewsletterCampaignRecipient.countDocuments({
        campaign: id,
        status: "pending",
      }),
      NewsletterCampaignRecipient.countDocuments({
        campaign: id,
        status: "skipped",
      }),
    ]);

    return res.status(200).json({
      success: true,
      campaign,
      statistics: {
        sent,
        failed,
        pending,
        skipped,
      },
    });
  } catch (error) {
    console.error("GET NEWSLETTER CAMPAIGN DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch campaign details.",
    });
  }
};
