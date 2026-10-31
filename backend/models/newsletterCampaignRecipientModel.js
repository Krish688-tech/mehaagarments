import mongoose from "mongoose";

const newsletterCampaignRecipientSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsletterCampaign",
      required: true,
      index: true,
    },

    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsletterSubscriber",
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "sent", "failed", "skipped"],
      default: "pending",
      index: true,
    },

    processingAt: {
      type: Date,
      default: null,
    },

    messageId: {
      type: String,
      default: null,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

newsletterCampaignRecipientSchema.index(
  { campaign: 1, subscriber: 1 },
  { unique: true },
);

newsletterCampaignRecipientSchema.index({ campaign: 1, status: 1 });

const NewsletterCampaignRecipient = mongoose.model(
  "NewsletterCampaignRecipient",
  newsletterCampaignRecipientSchema,
);

export default NewsletterCampaignRecipient;
