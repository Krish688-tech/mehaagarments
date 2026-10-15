import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
      console.error("Google authentication environment variables are missing");

      return res.status(500).json({
        success: false,
        message: "Google Sign-In is temporarily unavailable",
      });
    }

    // Verify the Google ID token on the backend.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account verification failed",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const name = payload.name?.trim();

    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Your Google profile must include a valid name",
      });
    }

    // Match by Google ID first, then by verified email.
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        // Link the verified Google account to the existing account.
        user.googleId = googleId;
        await user.save();
      } else {
        // Create a new Google-only customer account.
        user = await User.create({
          name,
          email,
          googleId,
          role: "customer",
        });
      }
    }

    // Never allow an inactive account to sign in.
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive",
      });
    }

    // Preserve the existing seven-day JWT authentication format.
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Google Sign-In successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account conflict occurred. Please try signing in again.",
      });
    }

    // Do not log the Google credential or ID token.
    console.error("Google Login Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Google Sign-In failed. Please try again.",
    });
  }
};
