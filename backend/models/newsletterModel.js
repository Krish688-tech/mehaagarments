
import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    isSubscribed: {
      type: Boolean,
      default: true,
    },

    consent: {
      type: Boolean,
      required: true,
      default: false,
    },

    consentAt: {
      type: Date,
      default: null,
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },

    unsubscribedAt: {
      type: Date,
      default: null,
    },

    source: {
      type: String,
      default: "website_footer",
    },
  },
  {
    timestamps: true,
  }
);

const NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  newsletterSchema
);

export default NewsletterSubscriber;
