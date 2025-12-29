import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { generatePlan } from "../legacyapi";
import { geocodeLocation } from "../geocode";
import { getCurrentWeather } from "../services/weatherApi";
import PlannerSection from "../components/PlannerSection";
import LoadingSpinner from "../components/LoadingSpinner";
import HiddenGems from "./HiddenGems";
import "../styles/landing.css";

export default function Planner() {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="app-container planner-page"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div
        variants={itemVariants}
        style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Link
          to="/"
          className="back-link"
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "1.05rem",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.3s ease",
          }}
        >
          ← Back to Home
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="tabs planner-tabs">
        <motion.button
          className={`tab-btn ${mode === "planner" ? "active" : ""}`}
          onClick={() => setMode("planner")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          🗓 Planner
        </motion.button>
        <motion.button
          className={`tab-btn ${mode === "hidden" ? "active" : ""}`}
          onClick={() => setMode("hidden")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          ⭐ Hidden Gems
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {mode === "hidden" && (
          <motion.div
            key="hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <HiddenGems />
          </motion.div>
        )}

        {mode === "planner" && (
          <motion.div
            key="planner"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
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

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginTop: 32 }}
                >
                  <LoadingSpinner label="Generating plan" />
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginTop: 32 }}
                >
                  <div className="error">{error}</div>
                  <div style={{ marginTop: 16 }}>
                    <motion.button
                      className="cta ghost"
                      onClick={generate}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try Again
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {planResponse && (
                <motion.section
                  className="results-section"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="results-inner">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <h2 className="section-title">✨ Your Personalized Hangout Plan</h2>
                      <p className="section-subtitle">Based on your mood, budget, time & weather</p>
                    </motion.div>

                    <motion.div
                      className="results-content"
                      style={{ marginTop: 24 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.p
                        className="muted"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ fontSize: "1.05rem", marginBottom: 24 }}
                      >
                        🌦 Weather adapted for: <b>{planResponse.weather_used}</b>
                      </motion.p>

                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                      >
                        {planResponse.plan.optimized_plan.map((p, i) => (
                          <motion.div
                            key={i}
                            className="plan-card"
                            variants={cardVariants}
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
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
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div
                        style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.button
                          className="form-control"
                          onClick={() => navigator.clipboard.writeText(planResponse.share_url)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ fontSize: "1rem", padding: "12px 20px" }}
                        >
                          📋 Copy Shareable Plan Link
                        </motion.button>

                        <motion.div
                          className="poll"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 }}
                          style={{ minWidth: 280, padding: 20 }}
                        >
                          <h3 style={{ margin: 0, marginBottom: 16, fontSize: "1.2rem" }}>📅 Pick a Time</h3>
                          {pollSlots.map((s, i) => (
                            <motion.div
                              key={i}
                              onClick={() => vote(i)}
                              style={{
                                cursor: "pointer",
                                padding: 12,
                                borderRadius: 10,
                                marginBottom: 8,
                                fontSize: "1rem",
                                transition: "background 0.2s",
                              }}
                              whileHover={{ scale: 1.03, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {s.label} 👍 {s.votes}
                            </motion.div>
                          ))}
                          <p className="muted" style={{ marginTop: 16, fontSize: "1rem" }}>
                            Best time: {bestSlot.label}
                          </p>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

