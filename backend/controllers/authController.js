import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../services/emailService.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REGISTER
export const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Normalize input
    name = name.trim();
    email = email.trim().toLowerCase();

    // Validate name
    if (name.length < 2) {
      return res.status(400).json({
        message: "Please enter a valid name",
      });
    }

    // Validate email
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
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

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    // Validate email
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    // Generic authentication error
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is currently inactive",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
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

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

// FORGOT PASSWORD

export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    email = email.trim().toLowerCase();

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email });

    // Do not reveal whether an account exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, password reset instructions have been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Reset Your Mehaa Garments Password",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; color: #222;">
        <h2 style="margin-bottom: 8px;">Mehaa Garments</h2>
        <h3>Password Reset Request</h3>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #111; color: #fff; padding: 14px 22px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 15 minutes and can only be used once.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #777; font-size: 13px;">Mehaa Garments Customer Support</p>
      </div>
    `,
        text: `Hello ${user.name}, reset your Mehaa Garments password using this link: ${resetUrl}. This link expires in 15 minutes.`,
        userId: user._id.toString(),
        emailType: "PASSWORD_RESET",
      });
      if (!emailResult.sent) {
        throw new Error("Password reset email was not sent");
      }
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      console.error("Password reset email failed:", emailError.message);

      return res.status(500).json({
        success: false,
        message:
          "Unable to send the password reset email. Please try again later.",
      });
    }
    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

// RESET PASSWORD

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Password reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    // Hash the token received from the reset URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that has not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    user.password = hashedPassword;

    // Invalidate the reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};
