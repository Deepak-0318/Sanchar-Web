// src/geocode.js

const locationCache = {}; // 👈 simple in-memory cache

export async function geocodeLocation(placeName) {
  if (!placeName) {
    throw new Error("Empty location");
  }

  // 🔁 CACHE HIT
  if (locationCache[placeName]) {
    console.log("📍 Using cached coordinates");
    return locationCache[placeName];
  }

  const query = encodeURIComponent(`${placeName}, Karnataka, India`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "SancharAI/1.0 (education project)",
    },
  });

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Location not found");
  }

  const coords = {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };

  // 💾 SAVE TO CACHE
  locationCache[placeName] = coords;

  return coords;
}
