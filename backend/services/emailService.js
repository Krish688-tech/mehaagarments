import EmailLog from "../models/emailLogModel.js";

// ==========================================
// RESEND EMAIL CONFIGURATION
// ==========================================

const getFromAddress = () => {
  return process.env.EMAIL_FROM || "Mehaa Garments <support@mehaagarments.in>";
};

const getAdminEmail = () => {
  return process.env.ADMIN_EMAIL;
};

// ==========================================
// GENERIC SEND EMAIL — RESEND API
// ==========================================

export const sendEmail = async ({
  to,
  subject,
  html,
  text = "",
  orderId = null,
  userId = null,
  emailType = null,
}) => {
  if (!to) {
    throw new Error("Email recipient is required");
  }

  if (!emailType || (!orderId && !userId) || (orderId && userId)) {
    throw new Error(
      "Provide an emailType and exactly one of orderId or userId",
    );
  }

  const isPasswordReset = emailType === "PASSWORD_RESET";

  if (isPasswordReset && !userId) {
    throw new Error("Password reset emails require a userId");
  }

  if (!isPasswordReset && !orderId) {
    throw new Error("Order emails require an orderId");
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const recipient = String(to).trim().toLowerCase();

  const logFilter = orderId
    ? { order: orderId, type: emailType, recipient }
    : { user: userId, type: emailType, recipient };

  let emailLog = null;

  try {
    emailLog = await EmailLog.findOne(logFilter);

    if (emailLog?.status === "sent" && !isPasswordReset) {
      return { sent: true, skipped: true, reason: "already_sent" };
    }

    if (!emailLog) {
      try {
        emailLog = await EmailLog.create({
          ...(orderId ? { order: orderId } : { user: userId }),
          type: emailType,
          recipient,
          subject,
          status: "pending",
          attempts: 0,
        });
      } catch (error) {
        if (error?.code !== 11000) throw error;

        emailLog = await EmailLog.findOne(logFilter);

        if (!emailLog) throw error;

        if (emailLog.status === "sent") {
          return { sent: true, skipped: true, reason: "already_sent" };
        }
      }
    }

    if (isPasswordReset && emailLog.status === "sent") {
      emailLog.attempts = 0;
      emailLog.messageId = null;
      emailLog.sentAt = null;
    }

    if (emailLog.attempts >= 3) {
      return {
        sent: false,
        skipped: true,
        reason: "maximum_attempts_reached",
      };
    }

    emailLog.attempts += 1;
    emailLog.status = "pending";
    emailLog.subject = subject;
    emailLog.error = null;
    emailLog.failedAt = null;
    await emailLog.save();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: [recipient],
        subject,
        html,
        ...(text ? { text } : {}),
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result?.message ||
          result?.error ||
          `Resend API request failed with status ${response.status}`,
      );
    }

    emailLog.status = "sent";
    emailLog.messageId = result.id || null;
    emailLog.sentAt = new Date();
    emailLog.error = null;
    await emailLog.save();

    console.log(`EMAIL SENT: ${emailType} → ${recipient}`);

    return {
      sent: true,
      messageId: result.id || null,
      emailLog,
    };
  } catch (error) {
    if (emailLog && emailLog.status !== "sent") {
      emailLog.status = "failed";
      emailLog.failedAt = new Date();
      emailLog.error = error?.message || "Unknown email sending error";
      await emailLog.save().catch((logError) => {
        console.error("Could not update email failure log:", logError.message);
      });
    }

    console.error(`EMAIL FAILED: ${emailType} → ${recipient}`, error.message);
    throw error;
  }
};

// ==========================================
// FORMAT CURRENCY
// ==========================================

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

// ==========================================
// ORDER ITEMS HTML
// ==========================================

const buildOrderItemsHtml = (order) => {
  return (
    order.orderItems
      ?.map(
        (item) => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;">
              <strong style="color:#171717;">
                ${item.name}
              </strong>
              <div style="font-size:13px;color:#777;margin-top:4px;">
                Quantity: ${item.quantity}
              </div>
            </td>

            <td
              align="right"
              style="padding:12px 0;border-bottom:1px solid #eeeeee;font-weight:600;"
            >
              ${formatCurrency(Number(item.price) * Number(item.quantity))}
            </td>
          </tr>
        `,
      )
      .join("") || ""
  );
};

// ==========================================
// SHIPPING ADDRESS HTML
// ==========================================

const buildShippingAddressHtml = (order) => {
  const address = order.shippingAddress || {};

  return `
    <div style="font-size:14px;line-height:1.7;color:#555;">
      <strong style="color:#171717;">
        ${address.firstName || ""} ${address.lastName || ""}
      </strong>
      <br />

      ${address.address || ""}
      ${address.apartment ? `<br />${address.apartment}` : ""}

      <br />

      ${address.city || ""},
      ${address.state || ""}
      - ${address.pincode || ""}

      <br />

      ${address.country || "India"}

      ${address.phone ? `<br />Phone: ${address.phone}` : ""}
    </div>
  `;
};

// ==========================================
// BRAND HEADER
// ==========================================

const buildEmailHeader = () => {
  return `
    <div
      style="
        background:#111111;
        padding:28px 30px;
        text-align:center;
      "
    >
      <div
        style="
          color:#ffffff;
          font-family:Georgia,serif;
          font-size:28px;
          letter-spacing:6px;
        "
      >
        MEHAA
      </div>

      <div
        style="
          color:#bbbbbb;
          font-size:11px;
          letter-spacing:3px;
          margin-top:6px;
        "
      >
        GARMENTS
      </div>
    </div>
  `;
};

// ==========================================
// EMAIL FOOTER
// ==========================================

const buildEmailFooter = () => {
  return `
    <div
      style="
        margin-top:35px;
        padding-top:25px;
        border-top:1px solid #eeeeee;
        text-align:center;
      "
    >
      <p
        style="
          margin:0;
          color:#777777;
          font-size:13px;
        "
      >
        Thank you for choosing Mehaa Garments.
      </p>

      <p
        style="
          margin:8px 0 0;
          color:#999999;
          font-size:12px;
        "
      >
        We're happy to be part of your journey.
      </p>
    </div>
  `;
};

// ==========================================
// CUSTOMER ORDER CONFIRMATION EMAIL
// ==========================================

export const sendCustomerOrderConfirmationEmail = async (order) => {
  const customerEmail = order.shippingAddress?.email;

  if (!customerEmail) {
    console.warn(
      `Customer order email skipped: no email for order ${order._id}`,
    );

    return null;
  }

  const customerName =
    `${order.shippingAddress?.firstName || ""} ${
      order.shippingAddress?.lastName || ""
    }`.trim() || "Customer";

  const paymentMethod =
    order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay";

  const paymentStatus =
    order.paymentStatus === "paid"
      ? "Paid"
      : order.paymentMethod === "cod"
        ? "Payment due on delivery"
        : order.paymentStatus;

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const orderUrl = `${frontendUrl}/orders/${order._id}`;

  const subject = `Order Confirmed — #${order._id
    .toString()
    .slice(-8)
    .toUpperCase()}`;

  const html = `
      <div
        style="
          margin:0;
          padding:30px 15px;
          background:#f7f5f2;
          font-family:Arial,Helvetica,sans-serif;
        "
      >
        <div
          style="
            max-width:650px;
            margin:0 auto;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
          "
        >

          ${buildEmailHeader()}

          <div style="padding:35px 30px;">

            <p
              style="
                margin:0;
                color:#777;
                font-size:12px;
                letter-spacing:2px;
                text-transform:uppercase;
              "
            >
              Order Confirmed
            </p>

            <h1
              style="
                margin:10px 0 0;
                color:#171717;
                font-family:Georgia,serif;
                font-size:30px;
                font-weight:normal;
              "
            >
              Thank you, ${customerName}.
            </h1>

            <p
              style="
                color:#555;
                font-size:15px;
                line-height:1.7;
                margin-top:15px;
              "
            >
              Your order has been successfully placed
              with Mehaa Garments. We're getting your
              beautiful sarees ready for you.
            </p>

            <div
              style="
                margin-top:25px;
                padding:18px;
                background:#f8f8f8;
                border-radius:12px;
              "
            >
              <div style="font-size:12px;color:#888;">
                ORDER ID
              </div>

              <div
                style="
                  margin-top:5px;
                  font-size:16px;
                  font-weight:bold;
                  color:#171717;
                "
              >
                #${order._id.toString().slice(-8).toUpperCase()}
              </div>
            </div>

            <h2
              style="
                margin:30px 0 12px;
                font-family:Georgia,serif;
                font-size:20px;
                font-weight:normal;
              "
            >
              Your Items
            </h2>

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="border-collapse:collapse;"
            >
              ${buildOrderItemsHtml(order)}
            </table>

            <div
              style="
                margin-top:20px;
                padding-top:18px;
                border-top:1px solid #eeeeee;
              "
            >
              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  font-size:15px;
                "
              >
                <span style="color:#777;">
                  Total
                </span>

                <strong style="color:#171717;">
                  ${formatCurrency(order.totalPrice)}
                </strong>
              </div>
            </div>

            <div
              style="
                margin-top:25px;
                padding:18px;
                background:#fafafa;
                border-radius:12px;
              "
            >
              <p style="margin:0;font-size:13px;color:#777;">
                Payment Method
              </p>

              <p
                style="
                  margin:6px 0 0;
                  font-size:15px;
                  font-weight:600;
                  color:#171717;
                "
              >
                ${paymentMethod}
              </p>

              <p
                style="
                  margin:12px 0 0;
                  font-size:13px;
                  color:#777;
                "
              >
                Payment Status
              </p>

              <p
                style="
                  margin:6px 0 0;
                  font-size:15px;
                  font-weight:600;
                  color:#171717;
                "
              >
                ${paymentStatus}
              </p>
            </div>

            <h2
              style="
                margin:30px 0 12px;
                font-family:Georgia,serif;
                font-size:20px;
                font-weight:normal;
              "
            >
              Delivery Address
            </h2>

            ${buildShippingAddressHtml(order)}

            <div style="text-align:center;margin-top:30px;">
              <a
                href="${orderUrl}"
                style="
                  display:inline-block;
                  padding:13px 25px;
                  background:#111111;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:30px;
                  font-size:14px;
                  font-weight:600;
                "
              >
                View My Order
              </a>
            </div>

            ${buildEmailFooter()}

          </div>
        </div>
      </div>
    `;

  const text = `
Order Confirmed — Mehaa Garments

Thank you, ${customerName}.

Your order #${order._id
    .toString()
    .slice(-8)
    .toUpperCase()} has been successfully placed.

Payment Method: ${paymentMethod}
Payment Status: ${paymentStatus}
Total: ${formatCurrency(order.totalPrice)}

View your order:
${orderUrl}
    `.trim();

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text,
    orderId: order._id,
    emailType: "ORDER_CONFIRMATION",
  });
};

/* ==========================================
   CUSTOMER DISPATCH EMAIL
========================================== */

export const sendCustomerDispatchedEmail = async (order) => {
  const customerEmail = order.shippingAddress?.email;

  if (!customerEmail) {
    console.warn(`Dispatch email skipped: no email for order ${order._id}`);
    return null;
  }

  const customerName =
    `${order.shippingAddress?.firstName || ""} ${
      order.shippingAddress?.lastName || ""
    }`.trim() || "Customer";

  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const orderUrl = `${frontendUrl}/orders/${order._id}`;

  const trackingUrl = order.shipping?.trackingUrl || null;
  const awb = order.shipping?.awb || null;
  const courierName = order.shipping?.courierName || null;

  const subject = `Your Order Has Been Dispatched — #${orderNumber}`;

  const html = `
    <div style="margin:0;padding:30px 15px;background:#f7f5f2;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:650px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;">
        ${buildEmailHeader()}

        <div style="padding:35px 30px;">
          <p style="margin:0;color:#777;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
            Shipping Confirmation
          </p>

          <h1 style="margin:10px 0;color:#171717;font-family:Georgia,serif;font-size:30px;font-weight:normal;">
            Your order is on its way!
          </h1>

          <p style="color:#555;font-size:15px;line-height:1.7;">
            Hi ${customerName}, your Mehaa Garments order has been handed over
            to the courier for delivery. Thank you for shopping with us!
          </p>

          <div style="margin-top:25px;padding:18px;background:#f8f8f8;border-radius:12px;">
            <p style="margin:0;color:#888;font-size:12px;">ORDER ID</p>
            <p style="margin:5px 0 0;color:#171717;font-size:16px;font-weight:bold;">
              #${orderNumber}
            </p>

            ${
              courierName
                ? `<p style="margin:14px 0 0;color:#777;font-size:13px;">COURIER PARTNER</p>
                   <p style="margin:5px 0 0;color:#171717;font-weight:600;">${courierName}</p>`
                : ""
            }

            ${
              awb
                ? `<p style="margin:14px 0 0;color:#777;font-size:13px;">TRACKING / AWB NUMBER</p>
                   <p style="margin:5px 0 0;color:#171717;font-weight:600;">${awb}</p>`
                : ""
            }
          </div>

          ${
            trackingUrl
              ? `<div style="text-align:center;margin-top:28px;">
                   <a href="${trackingUrl}" style="display:inline-block;padding:13px 25px;background:#111111;color:#ffffff;text-decoration:none;border-radius:30px;font-size:14px;font-weight:600;">
                     Track Your Order
                   </a>
                 </div>`
              : `<p style="color:#777;font-size:13px;line-height:1.6;margin-top:22px;">
                   Tracking details will be available when provided by the courier.
                 </p>`
          }

          <div style="margin-top:28px;padding:18px;background:#fff8ed;border:1px solid #f0dfc4;border-radius:12px;">
            <h2 style="margin:0 0 8px;color:#171717;font-size:16px;">
              Important Order Information
            </h2>
            <p style="margin:0;color:#555;font-size:13px;line-height:1.8;">
              Your order has been dispatched. Routine change-of-mind
              cancellations are not available after dispatch under our
              cancellation policy. This does not limit any rights or remedies
              available to you under applicable law.
            </p>
          </div>

          <div style="text-align:center;margin-top:30px;">
            <a href="${orderUrl}" style="display:inline-block;padding:13px 25px;background:#111111;color:#ffffff;text-decoration:none;border-radius:30px;font-size:14px;font-weight:600;">
              View My Order
            </a>
          </div>

          ${buildEmailFooter()}
        </div>
      </div>
    </div>
  `;

  const text = `
Your Order Has Been Dispatched — Mehaa Garments

Hi ${customerName},

Your order #${orderNumber} has been handed over to the courier.

${courierName ? `Courier: ${courierName}` : ""}
${awb ? `Tracking / AWB Number: ${awb}` : ""}
${trackingUrl ? `Track your order: ${trackingUrl}` : ""}

Routine change-of-mind cancellations are not available after dispatch under our cancellation policy. This does not limit any rights or remedies available to you under applicable law.

View your order: ${orderUrl}
  `.trim();

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text,
    orderId: order._id,
    emailType: "ORDER_DISPATCHED",
  });
};

// ==========================================
// CUSTOMER DELIVERED EMAIL
// ==========================================

export const sendCustomerDeliveredEmail = async (order) => {
  const customerEmail = order.shippingAddress?.email;

  if (!customerEmail) {
    console.warn(`Delivered email skipped: no email for order ${order._id}`);

    return null;
  }

  const customerName =
    `${order.shippingAddress?.firstName || ""} ${
      order.shippingAddress?.lastName || ""
    }`.trim() || "Customer";

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const orderUrl = `${frontendUrl}/orders/${order._id}`;

  const deliveredDate = order.shipping?.deliveredAt || new Date();

  const subject = `Order Delivered — #${order._id
    .toString()
    .slice(-8)
    .toUpperCase()}`;

  const html = `
      <div
        style="
          margin:0;
          padding:30px 15px;
          background:#f7f5f2;
          font-family:Arial,Helvetica,sans-serif;
        "
      >
        <div
          style="
            max-width:650px;
            margin:0 auto;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
          "
        >

          ${buildEmailHeader()}

          <div style="padding:35px 30px;text-align:center;">

            <div
              style="
                width:60px;
                height:60px;
                margin:0 auto;
                border-radius:50%;
                background:#f0f8f3;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:28px;
              "
            >
              ✓
            </div>

            <p
              style="
                margin:22px 0 0;
                color:#777;
                font-size:12px;
                letter-spacing:2px;
                text-transform:uppercase;
              "
            >
              Successfully Delivered
            </p>

            <h1
              style="
                margin:10px 0 0;
                color:#171717;
                font-family:Georgia,serif;
                font-size:30px;
                font-weight:normal;
              "
            >
              Your order has arrived.
            </h1>

            <p
              style="
                color:#555;
                font-size:15px;
                line-height:1.7;
                margin-top:15px;
              "
            >
              Hi ${customerName}, your Mehaa Garments
              order has been successfully delivered.
              We hope you love your purchase.
            </p>

            <div
              style="
                margin-top:25px;
                padding:18px;
                background:#f8f8f8;
                border-radius:12px;
                text-align:left;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:12px;
                  color:#888;
                "
              >
                ORDER ID
              </p>

              <p
                style="
                  margin:5px 0 0;
                  font-size:16px;
                  font-weight:bold;
                  color:#171717;
                "
              >
                #${order._id.toString().slice(-8).toUpperCase()}
              </p>

              <p
                style="
                  margin:14px 0 0;
                  font-size:12px;
                  color:#888;
                "
              >
                DELIVERED ON
              </p>

              <p
                style="
                  margin:5px 0 0;
                  font-size:15px;
                  font-weight:600;
                  color:#171717;
                "
              >
                ${new Date(deliveredDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div style="text-align:center;margin-top:30px;">
              <a
                href="${orderUrl}"
                style="
                  display:inline-block;
                  padding:13px 25px;
                  background:#111111;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:30px;
                  font-size:14px;
                  font-weight:600;
                "
              >
                View Order
              </a>
            </div>

            ${buildEmailFooter()}

          </div>
        </div>
      </div>
    `;

  const text = `
Order Delivered — Mehaa Garments

Hi ${customerName},

Your order #${order._id
    .toString()
    .slice(-8)
    .toUpperCase()} has been successfully delivered.

Delivered on:
${new Date(deliveredDate).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})}

View your order:
${orderUrl}
    `.trim();

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text,
    orderId: order._id,
    emailType: "ORDER_DELIVERED",
  });
};

// ==========================================
// ADMIN NEW ORDER EMAIL
// ==========================================

export const sendAdminNewOrderEmail = async (order) => {
  const adminEmail = getAdminEmail();

  if (!adminEmail) {
    console.warn("Admin order email skipped: ADMIN_EMAIL is not configured");

    return null;
  }

  const customerName =
    `${order.shippingAddress?.firstName || ""} ${
      order.shippingAddress?.lastName || ""
    }`.trim() || "Customer";

  const paymentMethod =
    order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay";

  const subject = `New Order Received — #${order._id
    .toString()
    .slice(-8)
    .toUpperCase()}`;

  const html = `
      <div
        style="
          margin:0;
          padding:30px 15px;
          background:#f5f5f5;
          font-family:Arial,Helvetica,sans-serif;
        "
      >
        <div
          style="
            max-width:700px;
            margin:0 auto;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
          "
        >

          ${buildEmailHeader()}

          <div style="padding:30px;">

            <p
              style="
                color:#777;
                font-size:12px;
                letter-spacing:2px;
                text-transform:uppercase;
              "
            >
              New Order
            </p>

            <h1
              style="
                margin:8px 0 0;
                font-family:Georgia,serif;
                font-size:28px;
                font-weight:normal;
                color:#171717;
              "
            >
              A new order has been received.
            </h1>

            <div
              style="
                margin-top:25px;
                padding:18px;
                background:#f8f8f8;
                border-radius:12px;
              "
            >
              <strong>
                Order #${order._id.toString().slice(-8).toUpperCase()}
              </strong>

              <p style="margin:8px 0 0;color:#666;">
                Customer: ${customerName}
              </p>

              <p style="margin:5px 0 0;color:#666;">
                Email:
                ${order.shippingAddress?.email || "N/A"}
              </p>

              <p style="margin:5px 0 0;color:#666;">
                Phone:
                ${order.shippingAddress?.phone || "N/A"}
              </p>

              <p style="margin:5px 0 0;color:#666;">
                Payment:
                ${paymentMethod}
              </p>

              <p style="margin:5px 0 0;color:#666;">
                Payment Status:
                ${order.paymentStatus}
              </p>
            </div>

            <h2
              style="
                margin:28px 0 12px;
                font-family:Georgia,serif;
                font-size:20px;
                font-weight:normal;
              "
            >
              Products
            </h2>

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="border-collapse:collapse;"
            >
              ${buildOrderItemsHtml(order)}
            </table>

            <div
              style="
                margin-top:20px;
                padding-top:18px;
                border-top:1px solid #eeeeee;
              "
            >
              <strong>
                Total:
                ${formatCurrency(order.totalPrice)}
              </strong>
            </div>

            <h2
              style="
                margin:28px 0 12px;
                font-family:Georgia,serif;
                font-size:20px;
                font-weight:normal;
              "
            >
              Delivery Address
            </h2>

            ${buildShippingAddressHtml(order)}

          </div>
        </div>
      </div>
    `;

  const text = `
New Order Received — Mehaa Garments

Order:
#${order._id.toString().slice(-8).toUpperCase()}

Customer: ${customerName}
Email: ${order.shippingAddress?.email || "N/A"}
Phone: ${order.shippingAddress?.phone || "N/A"}

Payment Method: ${paymentMethod}
Payment Status: ${order.paymentStatus}

Total: ${formatCurrency(order.totalPrice)}
    `.trim();

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
    orderId: order._id,
    emailType: "NEW_ORDER_ADMIN",
  });
};

export default {
  sendEmail,
  sendCustomerOrderConfirmationEmail,
  sendCustomerDispatchedEmail,
  sendCustomerDeliveredEmail,
  sendAdminNewOrderEmail,
};
