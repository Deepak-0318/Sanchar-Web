import { useState } from "react";
import { generatePlan } from "./legacyapi";
import { geocodeLocation } from "./geocode";
import { getCurrentWeather } from "./services/weatherApi";
import HiddenGems from "./pages/HiddenGems";

function App() {
  const [mode, setMode] = useState("planner");

  // Planner inputs
  const [mood, setMood] = useState("chill");
  const [budget, setBudget] = useState(800);
  const [timeAvailable, setTimeAvailable] = useState("2-4 hours");
  const [startLocation, setStartLocation] = useState("Indiranagar");

  // Result state
  const [planResponse, setPlanResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Feature-4: Smart Scheduling (MVP)
  const [pollSlots, setPollSlots] = useState([
    { label: "Today 6–8 PM", votes: 0 },
    { label: "Tomorrow 10–12 AM", votes: 0 },
    { label: "Weekend Evening", votes: 0 },
  ]);

  const generate = async () => {
    setLoading(true);
    setError("");
    setPlanResponse(null);

    try {
      const coords = await geocodeLocation(startLocation);
      const weather = await getCurrentWeather(coords.lat, coords.lon);

      const response = await generatePlan({
        user_input: {
          mood,
          budget,
          time_available: timeAvailable,
          start_location: startLocation,
          weather: weather.condition,
        },
        start_lat: coords.lat,
        start_lon: coords.lon,
      });

      setPlanResponse({
        ...response,
        weather_used: weather.condition,
      });
    } catch (e) {
      console.error(e);
      setError("Unable to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const vote = (index) => {
    const updated = [...pollSlots];
    updated[index].votes += 1;
    setPollSlots(updated);
  };

  const bestSlot = pollSlots.reduce((a, b) =>
    b.votes > a.votes ? b : a
  );

  return (
    <div style={styles.container}>
      <h1>Sanchar AI</h1>

      <div style={styles.tabs}>
        <button onClick={() => setMode("planner")}>🗓 Planner</button>
        <button onClick={() => setMode("hidden")}>⭐ Hidden Gems</button>
      </div>

      {mode === "hidden" && <HiddenGems />}

      {mode === "planner" && (
        <>
          <div style={styles.form}>
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="chill">Chill</option>
              <option value="fun">Fun</option>
              <option value="romantic">Romantic</option>
            </select>

            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />

            <select
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
            >
              <option value="1-2 hours">1-2 hours</option>
              <option value="2-4 hours">2-4 hours</option>
              <option value="4-6 hours">4-6 hours</option>
            </select>

            <input
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
            />

            <button onClick={generate}>Generate Plan</button>
          </div>

          {loading && <p>Generating plan…</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {planResponse && (
            <>
              <p>
                🌦 Weather adapted for:{" "}
                <b>{planResponse.weather_used}</b>
              </p>

              {planResponse.plan.optimized_plan.map((p, i) => (
                <div key={i} style={styles.card}>
                  <b>
                    {p.place_name}
                    {p.is_hidden_gem && " ⭐"}
                  </b>
                  <p>
                    📍 {p.distance_km} km • ⏱️ {p.visit_time_hr} hr
                  </p>
                </div>
              ))}

              {/* Feature-3: Shareable Plan */}
              <button
                onClick={() =>
                  navigator.clipboard.writeText(planResponse.share_url)
                }
              >
                📋 Copy Shareable Plan Link
              </button>

              {/* Feature-4: Smart Scheduling */}
              <div style={styles.poll}>
                <h3>📅 Pick a Time</h3>
                {pollSlots.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => vote(i)}
                    style={{ cursor: "pointer" }}
                  >
                    {s.label} 👍 {s.votes}
                  </div>
                ))}
                <p>Best time: {bestSlot.label}</p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;

const styles = {
  container: {
    padding: 20,
    color: "#fff",
    background: "#121212",
    minHeight: "100vh",
  },
  form: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  card: {
    border: "1px solid #333",
    padding: 10,
    marginTop: 8,
    borderRadius: 6,
    background: "#1c1c1c",
  },
  poll: {
    marginTop: 20,
    padding: 10,
    border: "1px solid #333",
    borderRadius: 6,
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
  },
};
