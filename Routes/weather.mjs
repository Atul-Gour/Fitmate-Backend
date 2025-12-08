import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { groundName, city, state, matchDate, matchTime } = req.body;

  if (!groundName || !city || !state || !matchDate || !matchTime) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  res.status(200).json({ message: "ClearWeather on that day" });
});

export default router;
