// import dotenv from "dotenv";
// dotenv.config();
// import { getCoordinates } from "./getCoordinates.mjs";

// const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// export default async function getWeather({ groundName, area, city, state }) {
//   try {
//     const address = `${groundName}, ${area}, ${city}, ${state}`;

//     const coords = await getCoordinates(address);
//     if (!coords) return { error: "Coordinates not found" };

//     const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
//     const weatherRes = await fetch(weatherUrl);
//     const weatherData = await weatherRes.json();

//     if (weatherData.cod !== 200) return { error: weatherData.message };

//     return {
//       location: coords.displayName,
//       mapLink: coords.mapLink,
//       temp: weatherData.main.temp,
//       feels_like: weatherData.main.feels_like,
//       description: weatherData.weather[0].description,
//     };
//   } catch (err) {
//     console.error("Weather API error:", err);
//     return { error: "Failed to fetch weather" };
//   }
// }

export async function getWeatherPreview({ city, state, date, time }) {
  // TEMP / RULE-BASED / MOCK
  return `Clear weather expected in ${city} on ${date} around ${time}`;
}
