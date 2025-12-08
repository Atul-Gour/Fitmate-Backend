import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const username = req.user?.username || req.body?.username || "user";
    const ext = path.extname(file.originalname).replace(".", "") || "jpg";

    return {
      folder: "fitmate_profiles",
      public_id: `${username}-${Date.now()}`,
      format: ext,
      allowed_formats: ["jpg", "jpeg", "png"],
    };
  },
});

export const uploadProfile = multer({ storage: profileStorage });
