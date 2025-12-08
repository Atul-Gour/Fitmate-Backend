import { MatchData } from "../Mongoose/Schemas/matchDataSchema.mjs";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.setHours(0, 0, 0, 0));
  const end = new Date(now.setHours(23, 59, 59, 999));
  return { start, end };
}

export async function getFeaturedMatches(limit = 5) {
  const { start, end } = getTodayRange();

  const matches = await MatchData.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("createdBy")
    .sort({ createdAt: -1 })
    .limit(limit);

  return matches.map((m) => ({
    _id: m._id,
    matchName: m.matchName || "Unnamed Match",
    sportsType: m.sportsType || "Unknown",
    address: {
      city: m.address?.city || "Unknown",
      state: m.address?.state || "Unknown",
    },
    date: m.date,
    coordinates: m.address?.coordinates || null,
    matchType: m.matchType || "Intermediate",
    playersRequired: m.playersRequired || 0,
    createdBy: m.createdBy?.name || "Unknown",
    img: m.img || "/default-match.png",
    notes: m.notes || "",
  }));
}
