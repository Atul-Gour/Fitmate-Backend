import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";

export async function getCountOfMatches(userDataId) {
  try {
    const user = await UserData.findOne(
      { _id: userDataId },
      { matchHistory: 1, _id: 0 }
    ).populate("matchHistory.matchId");

    if (!user) {
      return {};
    }

    const counts = {};
    let totalCountOfMatches = 0;
    if (!user.matchHistory || user.matchHistory.length === 0) counts["total Matches"] = 0;

    user.matchHistory.forEach((h) => {
      const sport = h.matchId?.sportsType;
      if (sport) {
        const sportUpper = sport.toUpperCase();
        counts[sportUpper] = (counts[sportUpper] || 0) + 1;
        totalCountOfMatches++;
      }
    });

    return { counts, totalCountOfMatches };
  } catch (err) {
    console.error("Error counting matches:", err);
    return {};
  }
}
