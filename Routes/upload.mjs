import express from "express";
import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";

import { uploadProfile } from "../config/cloudinaryConfig.mjs";

const router = express.Router();



router.post("/upload/:userId", uploadProfile.single("image"), async (req, res) => {
  try {
    const userId = req.params.userId;

    const updatedUser = await UserData.findByIdAndUpdate(
      userId,
      { profileImage: req.file.path },
      { new: true }
    );

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: req.file.path,
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
