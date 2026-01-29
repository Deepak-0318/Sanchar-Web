const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function fetchWeather(preferredLocation) {
  if (!preferredLocation) return "clear";

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${preferredLocation}&appid=${WEATHER_API_KEY}`
  );

  const data = await res.json();

  if (!data.weather || !data.weather.length) return "clear";

  return data.weather[0].main.toLowerCase().includes("rain")
    ? "rainy"
    : "clear";
}
