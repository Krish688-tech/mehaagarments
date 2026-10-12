import cloudinary from "../config/cloudinary.js";

export const generateUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(
      new Date().getTime() / 1000
    );

    const folder = "mehaa-garments/products";

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error(
      "Cloudinary signature error:",
      error
    );

    res.status(500).json({
      message: "Unable to generate upload signature",
    });
  }
};