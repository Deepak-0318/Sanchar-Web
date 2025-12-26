import { useState } from "react";
import { fetchHiddenGems } from "../services/placesApi";
import { geocodeLocation } from "../geocode";
import HiddenGemCard from "../components/HiddenGemCard";
import "../styles/discover.css";

export default function HiddenGems() {
  const [location, setLocation] = useState("Indiranagar");
  const [radiusKm, setRadiusKm] = useState(5);
  const [category, setCategory] = useState("all"); // ✅ NEW

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplore = async () => {
    setLoading(true);
    setError("");
    setPlaces([]);

    try {
      // 1️⃣ Convert text → lat/lon
      const coords = await geocodeLocation(location);

      // 2️⃣ Fetch hidden gems (already ordered by distance)
      const data = await fetchHiddenGems({
        lat: coords.lat,
        lon: coords.lon,
        radiusKm,
      });

      setPlaces(data);
    } catch (err) {
      console.error(err);
      setError("Could not find this location. Try nearby area.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FRONTEND FILTER (NO BACKEND CHANGE)
  const filteredPlaces =
    category === "all"
      ? places
      : places.filter((p) => p.category === category);

  return (
    <div className="discover-page">
      <h2>⭐ Hidden Gems Explorer</h2>
      <p>Discover lesser-known places around any area</p>

      {/* 🔍 INPUT CONTROLS */}
      <div className="explore-controls">
        <input
          type="text"
          placeholder="Enter area (Eg: Indiranagar, Jayanagar)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <select
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
        >
          <option value={2}>Within 2 km</option>
          <option value={5}>Within 5 km</option>
          <option value={10}>Within 10 km</option>
        </select>

        {/* ✅ CATEGORY FILTER */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="cafe">Cafés</option>
          <option value="food">Food</option>
          <option value="nature_park">Nature / Parks</option>
          <option value="religious">Spiritual</option>
          <option value="other">Others</option>
        </select>

        <button onClick={handleExplore}>
          Explore Hidden Gems
        </button>
      </div>

      {/* 🔄 STATES */}
      {loading && <p>Finding hidden gems near you…</p>}
      {error && <p className="error">{error}</p>}

      {/* 📍 RESULTS */}
      <div className="cards-container">
        {filteredPlaces.map((place) => (
          <HiddenGemCard key={place.place_id} place={place} />
        ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && filteredPlaces.length === 0 && !error && (
        <p style={{ marginTop: "20px", color: "#777" }}>
          No hidden gems found for this category in this area.
        </p>
      )}
    </div>
  );
}
