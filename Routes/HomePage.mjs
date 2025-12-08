import { Router } from "express";
import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";
import { getUserActivity } from "../helper/getUserActivity.mjs";
import { getLeaderboard } from "../helper/getLeaderboard.mjs";
import { getRecommendedMatches } from "../helper/getRecommendedMatches.mjs";
import { getFeaturedMatches } from "../helper/getFeaturedMatches.mjs";
import { getMonthlyProgress } from "../helper/monthlyProgressHelper.mjs";
import { getCountOfMatches } from "../helper/getCountOfMatches.mjs";
import { isAuthenticated } from "./Authorisation.mjs"; 

const router = Router();

router.get("/api/home/", isAuthenticated, async (req, res) => {
  let userData;
  try {
    userData = await UserData.findOne({ userId: req.user.id }).populate(
      "matchHistory.matchId"
    );
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching user data may server is offline" });
  }
  if (!userData) {
    return res.status(404).json({ message: "User not found" });
  }
  const userDataId = userData.id;

  const now = new Date();

  const scheduledMatches = userData.matchHistory
    .map((h) => h.matchId)
    .filter((m) => m && new Date(m.date) > now)
    .map((m) => ({
      matchName: m.matchName,
      date: m.date,
      address: m.address,
      sportsType: m.sportsType,
      playersRequired: m.playersRequired,
    }));

  const bodySpecs = {
    weight: userData.weight,
    height: userData.height,
    age: userData.age,
  };

  const userActivityData = await getUserActivity(userDataId);
  const { totalCountOfMatches, counts } = await getCountOfMatches(userDataId);
  const { monthlyMatches, progressPercentage, percentile } =
    await getMonthlyProgress(userDataId, 10);
  const weeklyLeaderboard = await getLeaderboard("weekly");
  const monthlyLeaderboard = await getLeaderboard("monthly");
  const recommendedMatches = await getRecommendedMatches(req.user.id);
  const featuredMatches = await getFeaturedMatches(3);

  res.status(200).send({
    name: req.user.name,
    bodySpecs,
    address: `${userData.address.area}, ${userData.address.city}`,
    totalCountOfMatches,
    counts,
    userActivityData,
    weeklyLeaderboard,
    monthlyLeaderboard,
    monthlyMatches,
    percentile: percentile,
    scheduledMatches,
    recommendedMatches,
    featuredMatches: featuredMatches || [],
    profileImage: userData.profileImage,
  });
});


export default router;
