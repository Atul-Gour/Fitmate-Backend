import { getCoordinates } from "./getCoordinates.mjs";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

function formatToAmPm(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export async function getWeatherPreview({ city, state, date, time }) {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error("OPENWEATHER_API_KEY missing");
    }

    const coords = await getCoordinates(`${city}, ${state}, India`);
    if (!coords?.lat || !coords?.lon) {
      return "Weather data unavailable for this location.";
    }

    const url =
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${coords.lat}&lon=${coords.lon}` +
      `&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data.list)) {
      return "Weather forecast unavailable.";
    }

    const targetTime = new Date(`${date}T${time}`);
    let closest = null;

    for (const slot of data.list) {
      const slotTime = new Date(slot.dt_txt);
      if (
        !closest ||
        Math.abs(slotTime - targetTime) <
          Math.abs(new Date(closest.dt_txt) - targetTime)
      ) {
        closest = slot;
      }
    }

    if (!closest) {
      return "No forecast available for selected time.";
    }

    const temp = closest.main.temp;
    const feelsLike = closest.main.feels_like;
    const description = closest.weather[0].description;

    const hour = Number(time.split(":")[0]);
    let hint;

    if (hour >= 5 && hour < 10) {
      hint = "Morning conditions are usually cooler.";
    } else if (hour >= 10 && hour < 14) {
      hint = "Late morning heat may build up.";
    } else if (hour >= 14 && hour < 18) {
      hint = "Afternoon heat expected. Stay hydrated.";
    } else if (hour >= 18 && hour < 22) {
      hint = "Evening conditions are pleasant for play.";
    } else {
      hint = "Late-night conditions may be cooler.";
    }

    const displayTime = formatToAmPm(time);

    return `${description} | ${temp}°C (feels like ${feelsLike}°C) around ${displayTime}. ${hint}`;
  } catch (err) {
    console.error("Weather preview error:", err.message);
    return "Weather preview currently unavailable.";
  }
}
