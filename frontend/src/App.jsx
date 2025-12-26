import { useState } from "react";
import { generatePlan } from "./legacyapi";
import { geocodeLocation } from "./geocode";
import HiddenGems from "./pages/HiddenGems";

function App() {
  // 🔀 MODE: planner | hidden
  const [mode, setMode] = useState("planner");

  // -------- Feature-1: Planner State --------
  const [mood, setMood] = useState("chill");
  const [budget, setBudget] = useState(800);
  const [timeAvailable, setTimeAvailable] = useState("2-4 hours");
  const [startLocation, setStartLocation] = useState("Indiranagar");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const coords = await geocodeLocation(startLocation);

      const response = await generatePlan({
        user_input: {
          mood,
          budget,
          time_available: timeAvailable,
          start_location: startLocation,
        },
        start_lat: coords.lat,
        start_lon: coords.lon,
      });

      setPlan(response);
    } catch (err) {
      console.error(err);
      setError("Could not find this location. Try nearby area name.");
    } finally {
      setLoading(false);
    }
  };

  const totalTime =
    plan?.optimized_plan?.reduce(
      (sum, p) => sum + (p.visit_time_hr || 0),
      0
    ) || 0;

  // ---------------- RENDER ----------------
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Sanchar AI</h1>

      {/* 🔀 MODE SWITCH */}
      <div style={styles.tabs}>
        <button
          style={mode === "planner" ? styles.activeTab : styles.tab}
          onClick={() => setMode("planner")}
        >
          🗓 Plan Hangout
        </button>
        <button
          style={mode === "hidden" ? styles.activeTab : styles.tab}
          onClick={() => setMode("hidden")}
        >
          ⭐ Hidden Gems
        </button>
      </div>

      {/* -------- Feature-2 -------- */}
      {mode === "hidden" && <HiddenGems />}

      {/* -------- Feature-1 -------- */}
      {mode === "planner" && (
        <>
          <p style={styles.subtitle}>Plan your hangout instantly</p>

          <div style={styles.form}>
            <label>Mood</label>
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="chill">Chill</option>
              <option value="fun">Fun</option>
              <option value="romantic">Romantic</option>
            </select>

            <label>Budget (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />

            <label>Time Available</label>
            <select
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
            >
              <option value="1-2 hours">1-2 hours</option>
              <option value="2-4 hours">2-4 hours</option>
              <option value="4-6 hours">4-6 hours</option>
            </select>

            <label>Start Location</label>
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={styles.button}
            >
              Generate Plan
            </button>
          </div>

          {loading && <p>Creating your plan…</p>}
          {error && <p style={styles.error}>{error}</p>}

          {plan && (
            <div style={styles.result}>
              <h3>Your Plan</h3>
              <p>⏱️ {totalTime.toFixed(1)} hrs</p>

              {plan.optimized_plan.map((p, i) => (
                <div key={i} style={styles.card}>
                    <h4>
                      {p.place_name}
                      {p.is_hidden_gem && (
                            <span style={styles.hiddenBadge}> ⭐ Hidden Gem</span>
                  )}
              </h4>

    <p>
      📍 {p.distance_km} km • ⏱️ {p.visit_time_hr} hr
    </p>
  </div>
))}


              <p style={styles.narration}>{plan.narration}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

/* 🎨 STYLES */
const styles = {
  container: {
    padding: "24px",
    maxWidth: "720px",
    margin: "0 auto",
    backgroundColor: "#121212",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  subtitle: {
    marginBottom: "20px",
    color: "#aaa",
  },

  /* 🔀 Tabs */
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  tab: {
    padding: "8px 14px",
    background: "#222",
    border: "1px solid #444",
    color: "#ccc",
    cursor: "pointer",
    borderRadius: "6px",
  },

  activeTab: {
    padding: "8px 14px",
    background: "#fff",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "6px",
  },

  /* Planner */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "6px",
    backgroundColor: "#fff",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },

  error: {
    color: "#ff6b6b",
    marginTop: "10px",
  },

  result: {
    marginTop: "30px",
  },

  card: {
    border: "1px solid #333",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#1f1f1f",
    marginBottom: "10px",
  },

  narration: {
    lineHeight: "1.6",
    color: "#ddd",
    marginTop: "10px",
  },

hiddenBadge: {
  marginLeft: "6px",
  color: "#ffd700",
  fontSize: "0.85rem",
  fontWeight: "bold",
},
};
