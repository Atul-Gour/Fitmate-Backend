import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";

export async function getLeaderboard(period = "weekly") {
  const users = await UserData.find({}).populate({ path: "userId", select: "username" });

  const now = new Date();

  const start = new Date(now);
  const end = new Date(now);

  if (period === "weekly") {
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);

    end.setTime(start.getTime());
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  }

  const leaderboard = users
    .map((user) => {
      const count = (user.matchHistory || []).filter((match) => {
        const date = new Date(match.date);
        return date >= start && date <= end;
      }).length;

      return {
        username: user.userId?.username || "Unknown",
        matches: count,
        profileImage: user.profileImage || null,
      };
    })
    .sort((a, b) => b.matches - a.matches);

  return leaderboard.slice(0, 10);
}
