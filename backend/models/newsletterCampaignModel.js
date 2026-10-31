import mongoose from "mongoose";

const newsletterCampaignSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    previewText: {
      type: String,
      default: "",
      trim: true,
    },

    bannerUrl: {
      type: String,
      default: "",
      trim: true,
    },

    heading: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    buttonText: {
      type: String,
      default: "EXPLORE COLLECTION",
      trim: true,
    },

    buttonUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "sending",
        "completed",
        "partially_completed",
        "failed",
      ],
      default: "draft",
      index: true,
    },

    totalRecipients: {
      type: Number,
      default: 0,
    },

    sentCount: {
      type: Number,
      default: 0,
    },

    failedCount: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const NewsletterCampaign = mongoose.model(
  "NewsletterCampaign",
  newsletterCampaignSchema
);

export default NewsletterCampaign;