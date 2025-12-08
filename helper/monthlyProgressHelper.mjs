import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";

export async function getMonthlyProgress(userId, monthlyGoal = 10) {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    
    const user = await UserData.findById(userId).populate("matchHistory.matchId");
    if (!user) return { monthlyMatches: 0, progressPercentage: 0, percentile: 0 };

   
    const monthlyMatches = user.matchHistory.reduce((count, h) => {
      const match = h.matchId;
      if (match?.matchDate) {
        const matchDate = new Date(match.matchDate);
        if (matchDate.getMonth() === currentMonth && matchDate.getFullYear() === currentYear) {
          return count + 1;
        }
      }
      return count;
    }, 0);

    const progressPercentage = monthlyGoal > 0 ? Math.min((monthlyMatches / monthlyGoal) * 100, 100) : 0;

    
    const allUsers = await UserData.find({}).populate("matchHistory.matchId");
    const userCounts = allUsers.map(u => 
      u.matchHistory.reduce((count, h) => {
        const match = h.matchId;
        if (match?.matchDate) {
          const matchDate = new Date(match.matchDate);
          if (matchDate.getMonth() === currentMonth && matchDate.getFullYear() === currentYear) {
            return count + 1;
          }
        }
        return count;
      }, 0)
    );


    const sortedCounts = [...userCounts].sort((a, b) => b - a);
    const rank = sortedCounts.indexOf(monthlyMatches) + 1; 
    const totalUsers = sortedCounts.length;
    const percentile = Math.round((rank / totalUsers) * 100); 

    return { monthlyMatches, progressPercentage, percentile };
  } catch (err) {
    console.error("Error calculating monthly progress:", err);
    return { monthlyMatches: 0, progressPercentage: 0, percentile: 0 };
  }
}
