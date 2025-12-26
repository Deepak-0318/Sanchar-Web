export const fetchHiddenGems = async ({ lat, lon, radiusKm = 5 }) => {
  const url = `https://sanchar-api.onrender.com/places/hidden/explore?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch hidden gems");
  }

  return res.json();
};
