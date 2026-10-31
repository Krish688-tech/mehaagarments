import crypto from "crypto";

// ==========================================
// GENERATE SECURE UNSUBSCRIBE TOKEN
// ==========================================

export const createUnsubscribeToken = (subscriber) => {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;

  if (!secret) {
    throw new Error("Newsletter unsubscribe secret is missing");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${subscriber._id}:${subscriber.email}`)
    .digest("hex");
};

// ==========================================
// VERIFY UNSUBSCRIBE TOKEN
// ==========================================

export const verifyUnsubscribeToken = (subscriber, token) => {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    return false;
  }

  try {
    const expected = createUnsubscribeToken(subscriber);

    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(token, "hex")
    );
  } catch (error) {
    console.error("Unsubscribe token verification error:", error.message);
    return false;
  }
};