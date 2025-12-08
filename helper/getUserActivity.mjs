import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";

export async function getUserActivity(userDataId) {
  const user = await UserData.findById(userDataId);
  if (!user) throw new Error("User not found");

  const now = new Date();


  const weeklyData = Array(7).fill(0).map((_, i) => ({ day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i], count: 0 }));
  const startOfWeek = new Date(now); 
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  (user.matchHistory || []).forEach(match => {
    const date = new Date(match.date);
    if(date >= startOfWeek && date <= endOfWeek) {
      weeklyData[date.getDay()].count += 1;
    }
  });


  const monthlyData = [];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const totalWeeks = Math.ceil((endOfMonth.getDate() + startOfMonth.getDay()) / 7);

  for(let w=0; w<totalWeeks; w++) {
    monthlyData.push({ week: `Week ${w+1}`, count: 0 });
  }

  (user.matchHistory || []).forEach(match => {
    const date = new Date(match.date);
    if(date >= startOfMonth && date <= endOfMonth) {
      const dayOfMonth = date.getDate();
      const weekIndex = Math.floor((dayOfMonth + startOfMonth.getDay() - 1) / 7);
      monthlyData[weekIndex].count += 1;
    }
  });

  return { weeklyData, monthlyData };
}
