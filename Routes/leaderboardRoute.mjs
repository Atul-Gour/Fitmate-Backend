import express from "express";
import { getLeaderboard } from "../helper/getLeaderboard.mjs";

const router = express.Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const period = req.query.period || "weekly";
    const leaderboard = await getLeaderboard(period);
    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

export default router;
