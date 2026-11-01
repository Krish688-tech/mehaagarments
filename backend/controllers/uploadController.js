
import cloudinary from "../config/cloudinary.js";

export const generateUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);

    const allowedFolders = [
      "mehaa-garments/products",
      "mehaa-garments/custom-designs",
      "mehaa-garments/reviews",
    ];

    const requestedFolder = req.query.folder || "mehaa-garments/products";

    if (!allowedFolders.includes(requestedFolder)) {
      return res.status(400).json({
        success: false,
        message: "Invalid upload folder",
      });
    }

    const folder = requestedFolder;

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate upload signature",
    });
  }
};
