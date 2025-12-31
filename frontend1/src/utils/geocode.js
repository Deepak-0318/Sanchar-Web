const cache = {};

export async function geocodeLocation(place) {
  if (!place) throw new Error("Location is empty");

  // Cache hit
  if (cache[place]) {
    return cache[place];
  }

  const query = encodeURIComponent(`${place}, Karnataka, India`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "SancharAI/1.0 (education project)",
    },
  });

  const data = await res.json();

  if (!data || data.length === 0) {
    throw new Error("Location not found");
  }

  const coords = {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };

  cache[place] = coords;
  return coords;
}
