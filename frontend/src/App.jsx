import { useState } from "react";
import { generatePlan } from "./legacyapi";
import { geocodeLocation } from "./geocode";
import { getCurrentWeather } from "./services/weatherApi";
import HiddenGems from "./pages/HiddenGems";
import Landing from "./pages/Landing";
import PlannerSection from "./components/PlannerSection";
import LoadingSpinner from "./components/LoadingSpinner";
import "./styles/landing.css";

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
    <>
      {/* Full-screen landing hero sits outside the app card container */}
      <Landing onGetStarted={() => document.getElementById("planner-section")?.scrollIntoView({ behavior: "smooth" })} />

      <div className="app-container">
        <div className="tabs">
        <button
          className={`tab-btn ${mode === "planner" ? "active" : ""}`}
          onClick={() => setMode("planner")}
        >
          🗓 Planner
        </button>
        <button
          className={`tab-btn ${mode === "hidden" ? "active" : ""}`}
          onClick={() => setMode("hidden")}
        >
          ⭐ Hidden Gems
        </button>
        </div>

        {mode === "hidden" && <HiddenGems />}

        {mode === "planner" && (
          <>
            <PlannerSection
            mood={mood}
            setMood={setMood}
            budget={budget}
            setBudget={setBudget}
            timeAvailable={timeAvailable}
            setTimeAvailable={setTimeAvailable}
            startLocation={startLocation}
            setStartLocation={setStartLocation}
            generate={generate}
            loading={loading}
            error={error}
          />

          <section className="results-section">
            <div className="results-inner">
              {planResponse && (
                <>
                  <h2 className="section-title">✨ Your Personalized Hangout Plan</h2>
                  <p className="section-subtitle">Based on your mood, budget, time & weather</p>
                </>
              )}

              {loading && (
                <div style={{ marginTop: 12 }}>
                  <LoadingSpinner label="Generating plan" />
                </div>
              )}

              {error && (
                <div style={{ marginTop: 12 }}>
                  <div className="error">{error}</div>
                  <div style={{ marginTop: 8 }}>
                    <button className="cta ghost" onClick={generate}>Try Again</button>
                  </div>
                </div>
              )}

              {planResponse && (
                <div className="results-content" style={{ marginTop: 14 }}>
                  <p className="muted">🌦 Weather adapted for: <b>{planResponse.weather_used}</b></p>

                  {planResponse.plan.optimized_plan.map((p, i) => (
                    <div key={i} className="plan-card">
                      <div className="plan-card-header">
                        <h3>
                          {p.place_name}
                          {p.is_hidden_gem && <span className="badge">Hidden Gem ⭐</span>}
                        </h3>
                      </div>

                      <div className="plan-meta">
                        <span>📍 {p.distance_km} km away</span>
                        <span>⏱️ {p.visit_time_hr} hrs</span>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="form-control" onClick={() => navigator.clipboard.writeText(planResponse.share_url)}>📋 Copy Shareable Plan Link</button>

                    <div style={{ minWidth: 220 }} className="poll">
                      <h3 style={{ margin: 0, marginBottom: 8 }}>📅 Pick a Time</h3>
                      {pollSlots.map((s, i) => (
                        <div key={i} onClick={() => vote(i)} style={{ cursor: "pointer", padding: 6, borderRadius: 8 }}>
                          {s.label} 👍 {s.votes}
                        </div>
                      ))}
                      <p className="muted" style={{ marginTop: 8 }}>Best time: {bestSlot.label}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </section>
          </>
        )}
      </div>
    </>
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
