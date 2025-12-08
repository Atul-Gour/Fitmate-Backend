import { MatchData } from "../Mongoose/Schemas/matchDataSchema.mjs";
import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";

export async function getRecommendedMatches(userId) {
  try {
    const userData = await UserData.findOne({ userId });
    if (!userData) return [];

    const userSports = (userData.sports || []).map((s) => s.toLowerCase());

    const { city = "", state = "" } = userData.address || {};

    let locationFilter = {};
  

    if (city || state) {
      locationFilter.$or = [];
      if (city) locationFilter.$or.push({ "address.city": city });
      if (state) locationFilter.$or.push({ "address.state": state });
    }

    if (userSports.length > 0) {
      locationFilter.sport = { $in: userSports };
    }

    const matches = await MatchData.find(locationFilter).populate({path: "createdBy"}).sort({ date: 1 });

    return matches.map((m) => ({
      _id: m._id,
      matchName: m.matchName || "Unnamed Match",
      sportsType: m.sportsType || "Unknown",
      address: {
        groundName: m.address?.groundName || "",
        area: m.address?.area || "",
        city: m.address?.city || "Unknown",
        state: m.address?.state || "Unknown",
      },
      coordinates: m.address?.coordinates || null,
      date: m.date, 
      matchType: m.matchType || "Intermediate",
      playersRequired: m.playersRequired || 0,
      createdBy: m.createdBy.name || "Unknown",
      img: m.img || "/default-match.png",
      notes: m.notes || "",
    }));
  } catch (err) {
    console.error("Error in getRecommendedMatches:", err);
    return [];
  }
};
