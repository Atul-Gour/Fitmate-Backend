import express from "express";
import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";

const router = express.Router();

router.get("/api/find-users", async (req, res) => {
  try {
    const users = await UserData.find(); 
    res.json(users); 
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});


export default router;
