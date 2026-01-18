import express from "express";
const router = express.Router();
import { getWeatherPreview } from "../helper/getWeather.mjs";

router.post("/api/match/weather-preview", async (req, res) => {
  const { city, state, matchDate, matchTime } = req.body;

  if (!city || !state || !matchDate || !matchTime) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const weather = await getWeatherPreview({
      city,
      state,
      date: matchDate,
      time: matchTime,
    });

    return res.json({ weather });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch weather preview" });
  }
});

export default router;