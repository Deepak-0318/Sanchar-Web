import { API_BASE_URL } from "../config";

export const fetchHiddenGems = async ({ lat, lon, radiusKm = 5 }) => {
  const url = `${API_BASE_URL}/places/hidden/explore?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch hidden gems");
  }

  return res.json();
};
