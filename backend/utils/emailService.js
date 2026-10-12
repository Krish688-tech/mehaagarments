import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async ({
  email,
  name,
  resetToken,
}) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [email],
    subject: "Reset Your Mehaa Garments Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset Your Password</title>
        </head>

        <body style="margin:0; padding:0; background:#f7f7f7; font-family:Arial, sans-serif;">
          <div style="max-width:600px; margin:40px auto; background:#ffffff; padding:40px 30px; border-radius:12px;">

            <h1 style="margin:0 0 20px; color:#222;">
              Mehaa Garments
            </h1>

            <h2 style="color:#333;">
              Reset Your Password
            </h2>

            <p style="font-size:16px; color:#555;">
              Hello ${name},
            </p>

            <p style="font-size:16px; line-height:1.6; color:#555;">
              We received a request to reset the password for your
              Mehaa Garments account.
            </p>

            <p style="font-size:16px; line-height:1.6; color:#555;">
              Click the button below to create a new password.
            </p>

            <div style="margin:30px 0;">
              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  background:#007d76;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:bold;
                "
              >
                Reset Password
              </a>
            </div>

            <p style="font-size:14px; line-height:1.6; color:#777;">
              This password reset link will expire in 15 minutes.
            </p>

            <p style="font-size:14px; line-height:1.6; color:#777;">
              If you did not request a password reset, you can safely
              ignore this email.
            </p>

            <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />

            <p style="font-size:13px; color:#999;">
              © Mehaa Garments. All rights reserved.
            </p>

          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Resend Email Error:", error);
    throw new Error("Failed to send password reset email");
  }

  return data;
};