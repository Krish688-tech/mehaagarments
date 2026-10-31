
import mongoose from "mongoose";
import crypto from "crypto";

import NewsletterSubscriber from "../models/newsletterModel.js";

// ==========================================
// EMAIL VALIDATION
// ==========================================

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ==========================================
// UNSUBSCRIBE TOKEN HELPERS
// ==========================================

const generateUnsubscribeToken = (subscriber) => {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;

  if (!secret) {
    throw new Error("Newsletter unsubscribe secret is missing");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${subscriber._id}:${subscriber.email}`)
    .digest("hex");
};

const verifyUnsubscribeToken = (subscriber, token) => {
  if (!/^[a-f0-9]{64}$/i.test(token || "")) {
    return false;
  }

  const expected = generateUnsubscribeToken(subscriber);

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(token, "hex")
  );
};

// ==========================================
// SUBSCRIBE NEWSLETTER
// POST /api/newsletter/subscribe
// PUBLIC
// ==========================================

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, consent } = req.body;

    // VALIDATE EMAIL

    if (
      typeof email !== "string" ||
      !isValidEmail(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // VALIDATE MARKETING CONSENT

    if (consent !== true) {
      return res.status(400).json({
        success: false,
        message: "Please agree to receive marketing emails.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // CHECK EXISTING SUBSCRIBER

    const existingSubscriber =
      await NewsletterSubscriber.findOne({
        email: normalizedEmail,
      });

    // ALREADY SUBSCRIBED

    if (existingSubscriber?.isSubscribed) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to our newsletter!",
      });
    }

    // REACTIVATE PREVIOUS SUBSCRIBER

    if (existingSubscriber) {
      existingSubscriber.isSubscribed = true;
      existingSubscriber.consent = true;
      existingSubscriber.consentAt = new Date();
      existingSubscriber.subscribedAt = new Date();
      existingSubscriber.unsubscribedAt = null;
      existingSubscriber.source = "website_footer";

      await existingSubscriber.save();

      return res.status(200).json({
        success: true,
        message: "Welcome back! Your subscription has been activated.",
      });
    }

    // CREATE NEW SUBSCRIBER

    await NewsletterSubscriber.create({
      email: normalizedEmail,
      isSubscribed: true,
      consent: true,
      consentAt: new Date(),
      subscribedAt: new Date(),
      source: "website_footer",
    });

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed! Welcome to Mehaa Garments.",
    });
  } catch (error) {
    // DUPLICATE EMAIL SAFETY

    if (error?.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to our newsletter!",
      });
    }

    console.error("NEWSLETTER SUBSCRIBE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to subscribe right now. Please try again later.",
    });
  }
};

// ==========================================
// UNSUBSCRIBE NEWSLETTER
// POST /api/newsletter/unsubscribe
// PUBLIC - SIGNED TOKEN REQUIRED
// ==========================================

export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { subscriberId, token } = req.body;

    if (
      !subscriberId ||
      !mongoose.Types.ObjectId.isValid(subscriberId) ||
      typeof token !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid unsubscribe request.",
      });
    }

    const subscriber = await NewsletterSubscriber.findById(
      subscriberId
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    if (!verifyUnsubscribeToken(subscriber, token)) {
      return res.status(403).json({
        success: false,
        message: "Invalid unsubscribe link.",
      });
    }

    if (!subscriber.isSubscribed) {
      return res.status(200).json({
        success: true,
        message: "You are already unsubscribed.",
      });
    }

    subscriber.isSubscribed = false;
    subscriber.unsubscribedAt = new Date();

    await subscriber.save();

    return res.status(200).json({
      success: true,
      message: "You have successfully unsubscribed from Mehaa Garments.",
    });
  } catch (error) {
    console.error("NEWSLETTER UNSUBSCRIBE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process unsubscribe request.",
    });
  }
};

// ==========================================
// ADMIN - GET NEWSLETTER SUBSCRIBERS
// GET /api/newsletter/admin
// ADMIN ONLY
// ==========================================

export const getNewsletterSubscribers = async (req, res) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const filter = {};

    if (req.query.status === "active") {
      filter.isSubscribed = true;
    } else if (req.query.status === "unsubscribed") {
      filter.isSubscribed = false;
    } else if (
      req.query.status &&
      req.query.status !== "all"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber status filter.",
      });
    }

    const [
      subscribers,
      total,
      activeCount,
      unsubscribedCount,
    ] = await Promise.all([
      NewsletterSubscriber.find(filter)
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      NewsletterSubscriber.countDocuments(filter),

      NewsletterSubscriber.countDocuments({
        isSubscribed: true,
      }),

      NewsletterSubscriber.countDocuments({
        isSubscribed: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      subscribers,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },

      stats: {
        total: activeCount + unsubscribedCount,
        active: activeCount,
        unsubscribed: unsubscribedCount,
      },
    });
  } catch (error) {
    console.error("GET NEWSLETTER SUBSCRIBERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch newsletter subscribers.",
    });
  }
};

// ==========================================
// ADMIN - EXPORT ACTIVE SUBSCRIBERS
// GET /api/newsletter/admin/export
// ADMIN ONLY
// ==========================================

export const exportNewsletterSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find({
      isSubscribed: true,
      consent: true,
    })
      .select("email subscribedAt")
      .sort({ subscribedAt: -1 })
      .lean();

    const escapeCSV = (value) => {
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    };

    const rows = [
      ["Email", "Subscribed At"],
      ...subscribers.map((subscriber) => [
        subscriber.email,
        subscriber.subscribedAt
          ? subscriber.subscribedAt.toISOString()
          : "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="mehaa-newsletter-subscribers.csv"'
    );

    return res.status(200).send("\uFEFF" + csv);
  } catch (error) {
    console.error("NEWSLETTER CSV EXPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export newsletter subscribers.",
    });
  }
};

// ==========================================
// INTERNAL HELPER FOR FUTURE EMAIL CAMPAIGNS
// ==========================================

export const createUnsubscribeToken = (subscriber) => {
  return generateUnsubscribeToken(subscriber);
};
