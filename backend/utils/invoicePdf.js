import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PassThrough } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(
  __dirname,
  "../assets/mehaa-logo.png",
);

// ==========================================
// COLORS
// ==========================================

const COLORS = {
  darkGreen: "#003F3B",
  green: "#00665F",
  gold: "#C9A227",
  lightGold: "#F4EBD0",
  text: "#1F2937",
  muted: "#6B7280",
  light: "#F8F8F6",
  border: "#E5E7EB",
  white: "#FFFFFF",
  success: "#15803D",
  orange: "#C2410C",
};

// ==========================================
// FORMAT CURRENCY
// ==========================================

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// ==========================================
// FORMAT DATE + TIME
// ==========================================

const formatDateTime = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==========================================
// ADD HORIZONTAL LINE
// ==========================================

const drawLine = (doc, y, color = COLORS.border) => {
  doc
    .strokeColor(color)
    .lineWidth(0.7)
    .moveTo(50, y)
    .lineTo(545, y)
    .stroke();
};

// ==========================================
// ADD SECTION TITLE
// ==========================================

const sectionTitle = (doc, title, y) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.darkGreen)
    .text(title.toUpperCase(), 50, y);

  drawLine(doc, y + 17);
};

// ==========================================
// GENERATE INVOICE PDF
// ==========================================

export const generateInvoicePdf = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        bufferPages: true,
        info: {
          Title: `Mehaa Garments Invoice ${
            order.invoice?.invoiceNumber || ""
          }`,
          Author: "Mehaa Garments",
          Subject: "Tax Invoice",
          Creator: "Mehaa Garments",
        },
      });

      const chunks = [];

      const stream = new PassThrough();

      stream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      stream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on("error", reject);

      doc.pipe(stream);

      // ==========================================
      // PAGE BACKGROUND
      // ==========================================

      doc
        .rect(0, 0, 595.28, 841.89)
        .fill(COLORS.white);

      // ==========================================
      // TOP BRAND HEADER
      // ==========================================

      doc
        .rect(0, 0, 595.28, 135)
        .fill(COLORS.darkGreen);

      // ==========================================
      // LOGO
      // ==========================================

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 45, 15, {
          fit: [100, 100],
          align: "center",
          valign: "center",
        });
      }

      // ==========================================
      // COMPANY DETAILS
      // ==========================================

      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor(COLORS.white)
        .text("MEHAA GARMENTS", 160, 30);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#D9E8E5")
        .text(
          "Chrompet, Chennai, Tamil Nadu - 600044",
          160,
          62,
        );

      doc
        .fontSize(8.5)
        .text(
          "Phone: 7418541436  |  Email: Mehaagarments@gmail.com",
          160,
          78,
        );

      doc
        .fontSize(8.5)
        .text(
          "www.MehaaGarments.in",
          160,
          94,
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("#E8D18A")
        .text(
          "GSTIN: 33ABEFG9524G1ZG",
          160,
          110,
        );

      // ==========================================
      // INVOICE TITLE
      // ==========================================

      doc
        .font("Helvetica-Bold")
        .fontSize(25)
        .fillColor(COLORS.darkGreen)
        .text("INVOICE", 400, 160);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text(
          "Original for Recipient",
          400,
          190,
        );

      // ==========================================
      // INVOICE DETAILS
      // ==========================================

      const invoiceNumber =
        order.invoice?.invoiceNumber || "N/A";

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text("INVOICE NUMBER", 50, 165);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.text)
        .text(invoiceNumber, 50, 180);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text("ISSUE DATE", 50, 207);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(
          formatDate(order.invoice?.issuedAt),
          50,
          222,
        );

      // ==========================================
      // ORDER NUMBER
      // ==========================================

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text("ORDER ID", 400, 217);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          `#${order._id.toString().slice(-8).toUpperCase()}`,
          400,
          232,
        );

      // ==========================================
      // CUSTOMER SECTION
      // ==========================================

      sectionTitle(doc, "Bill To", 275);

      const customerName =
        order.user?.name ||
        `${order.shippingAddress?.firstName || ""} ${
          order.shippingAddress?.lastName || ""
        }`.trim() ||
        "Customer";

      const customerEmail =
        order.user?.email ||
        order.shippingAddress?.email ||
        "";

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.text)
        .text(customerName, 50, 305);

      if (customerEmail) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(COLORS.muted)
          .text(customerEmail, 50, 322);
      }

      if (order.shippingAddress?.phone) {
        doc
          .fontSize(9)
          .text(
            `Phone: ${order.shippingAddress.phone}`,
            50,
            338,
          );
      }

      // ==========================================
      // DELIVERY ADDRESS
      // ==========================================

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.darkGreen)
        .text("DELIVERY ADDRESS", 310, 305);

      let addressY = 322;

      const address = order.shippingAddress;

      if (address?.address) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(COLORS.text)
          .text(address.address, 310, addressY, {
            width: 235,
          });

        addressY += 30;
      }

      if (address?.apartment) {
        doc.text(
          address.apartment,
          310,
          addressY,
          {
            width: 235,
          },
        );

        addressY += 15;
      }

      const cityLine = [
        address?.city,
        address?.state,
        address?.pincode,
      ]
        .filter(Boolean)
        .join(", ");

      if (cityLine) {
        doc.text(
          cityLine,
          310,
          addressY,
          {
            width: 235,
          },
        );

        addressY += 15;
      }

      if (address?.country) {
        doc.text(
          address.country,
          310,
          addressY,
          {
            width: 235,
          },
        );
      }

      // ==========================================
      // ITEMS TABLE
      // ==========================================

      const tableTop = 390;

      doc
        .rect(50, tableTop, 495, 32)
        .fill(COLORS.darkGreen);

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.white)
        .text("ITEM", 62, tableTop + 11);

      doc.text(
        "QTY",
        335,
        tableTop + 11,
        {
          width: 35,
          align: "center",
        },
      );

      doc.text(
        "UNIT PRICE",
        385,
        tableTop + 11,
        {
          width: 70,
          align: "right",
        },
      );

      doc.text(
        "TOTAL",
        475,
        tableTop + 11,
        {
          width: 55,
          align: "right",
        },
      );

      let rowY = tableTop + 32;

      const items = order.orderItems || [];

      items.forEach((item, index) => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const total = quantity * price;

        const rowHeight = 48;

        if (index % 2 === 0) {
          doc
            .rect(
              50,
              rowY,
              495,
              rowHeight,
            )
            .fill("#FAFAF8");
        }

        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(COLORS.text)
          .text(
            item.name || "Product",
            62,
            rowY + 10,
            {
              width: 245,
            },
          );

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(COLORS.muted)
          .text(
            `Item ${index + 1}`,
            62,
            rowY + 25,
          );

        doc
          .fontSize(9)
          .fillColor(COLORS.text)
          .text(
            quantity.toString(),
            335,
            rowY + 15,
            {
              width: 35,
              align: "center",
            },
          );

        doc.text(
          formatCurrency(price),
          385,
          rowY + 15,
          {
            width: 70,
            align: "right",
          },
        );

        doc
          .font("Helvetica-Bold")
          .text(
            formatCurrency(total),
            475,
            rowY + 15,
            {
              width: 55,
              align: "right",
            },
          );

        drawLine(
          doc,
          rowY + rowHeight,
        );

        rowY += rowHeight;
      });

      // ==========================================
      // SUMMARY
      // ==========================================

      const summaryY = Math.max(
        rowY + 25,
        530,
      );

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.darkGreen)
        .text(
          "PAYMENT DETAILS",
          50,
          summaryY,
        );

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          order.paymentMethod === "cod"
            ? "Cash on Delivery"
            : "Razorpay",
          50,
          summaryY + 22,
        );

      doc
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(
          `Payment Status: ${
            order.paymentStatus || "N/A"
          }`,
          50,
          summaryY + 39,
        );

      if (
        order.paymentResult?.razorpay_payment_id
      ) {
        doc.text(
          `Payment ID: ${order.paymentResult.razorpay_payment_id}`,
          50,
          summaryY + 54,
          {
            width: 245,
          },
        );
      }

      // ==========================================
      // TOTAL BOX
      // ==========================================

      const totalBoxX = 350;
      const totalBoxY = summaryY - 5;

      doc
        .roundedRect(
          totalBoxX,
          totalBoxY,
          195,
          125,
          8,
        )
        .fill(COLORS.light);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text(
          "SUBTOTAL",
          totalBoxX + 15,
          totalBoxY + 18,
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          formatCurrency(order.totalPrice),
          totalBoxX + 100,
          totalBoxY + 18,
          {
            width: 80,
            align: "right",
          },
        );

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text(
          "SHIPPING",
          totalBoxX + 15,
          totalBoxY + 43,
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          "Included",
          totalBoxX + 100,
          totalBoxY + 43,
          {
            width: 80,
            align: "right",
          },
        );

      drawLine(
        doc,
        totalBoxY + 67,
        "#D9D9D9",
      );

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.darkGreen)
        .text(
          "GRAND TOTAL",
          totalBoxX + 15,
          totalBoxY + 83,
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .fillColor(COLORS.darkGreen)
        .text(
          formatCurrency(order.totalPrice),
          totalBoxX + 85,
          totalBoxY + 80,
          {
            width: 95,
            align: "right",
          },
        );

      // ==========================================
      // GST NOTE
      // ==========================================

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(
          "GSTIN: 33ABEFG9524G1ZG",
          50,
          totalBoxY + 105,
        );

      // ==========================================
      // FOOTER
      // ==========================================

      const footerY = 765;

      doc
        .rect(0, footerY, 595.28, 76)
        .fill(COLORS.darkGreen);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(COLORS.white)
        .text(
          "Thank you for choosing Mehaa Garments.",
          50,
          footerY + 18,
          {
            width: 495,
            align: "center",
          },
        );

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#D9E8E5")
        .text(
          "This is a computer-generated invoice and does not require a signature.",
          50,
          footerY + 38,
          {
            width: 495,
            align: "center",
          },
        );

      doc
        .fontSize(7.5)
        .text(
          `Invoice issued on ${formatDateTime(
            order.invoice?.issuedAt,
          )}`,
          50,
          footerY + 53,
          {
            width: 495,
            align: "center",
          },
        );

      // ==========================================
      // FINISH
      // ==========================================

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};