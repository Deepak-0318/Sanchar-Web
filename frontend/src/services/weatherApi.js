export async function getCurrentWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weathercode,temperature_2m`;

  const res = await fetch(url);
  const data = await res.json();

  const code = data.current.weathercode;
  const temp = data.current.temperature_2m;

  // Basic weather classification
  let condition = "clear";

  if ([51, 53, 55, 61, 63, 65].includes(code)) {
    condition = "rainy";
  } else if ([2, 3].includes(code)) {
    condition = "cloudy";
  }

  if (temp > 32) {
    condition = "hot";
  }

  return {
    condition,
    temperature: temp,
  };
}
