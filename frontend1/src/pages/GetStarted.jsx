import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { geocodeLocation } from "../utils/geocode";

const questions = [
  {
    key: "mood",
    type: "options",
    title: "What’s the vibe today?",
    options: [
      { label: "Chill & Relaxed", value: "chill", emoji: "😌" },
      { label: "Fun & Lively", value: "fun", emoji: "🎉" },
      { label: "Romantic", value: "romantic", emoji: "❤️" },
      { label: "Adventure", value: "adventure", emoji: "🔥" },
    ],
  },
  {
    key: "budget",
    type: "options",
    title: "What’s your budget?",
    options: [
      { label: "Budget-friendly", value: "low", emoji: "💸" },
      { label: "Moderate", value: "medium", emoji: "💰" },
      { label: "Premium", value: "high", emoji: "💎" },
    ],
  },
  {
    key: "time",
    type: "options",
    title: "How much time do you have?",
    options: [
      { label: "1–2 hours", value: "1-2", emoji: "⏱️" },
      { label: "2–4 hours", value: "2-4", emoji: "⌛" },
      { label: "Half day", value: "half-day", emoji: "🌤️" },
      { label: "Full day", value: "full-day", emoji: "🌞" },
    ],
  },
  {
    key: "start_location",
    type: "input",
    title: "Where are you starting from?",
    placeholder: "Eg: Indiranagar, Bengaluru",
  },
  {
    key: "preferred_location",
    type: "input",
    title: "Where do you want to go?",
    placeholder: "Eg: MG Road, Bengaluru",
  },
];

export default function GetStarted() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const current = questions[step];

  const handleNext = async (value) => {
    const updated = { ...answers, [current.key]: value };
    setAnswers(updated);

    // FINAL STEP → GEO-CODE START LOCATION & NAVIGATE
    if (current.key === "preferred_location") {
      setLoading(true);
      try {
        const coords = await geocodeLocation(updated.start_location);

        navigate("/planner", {
          state: {
            mood: updated.mood,
            budget: updated.budget,
            time: updated.time,
            startLocation: updated.start_location,
            preferredLocation: updated.preferred_location,
            start_lat: coords.lat,
            start_lon: coords.lon,
          },
        });
      } catch (err) {
        alert("Could not find starting location. Try nearby area.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep((s) => s + 1);
    setInputValue("");
  };

  return (
    <div style={styles.wrapper}>
      <p style={styles.step}>
        Step {step + 1} of {questions.length}
      </p>

      <h2 style={styles.title}>{current.title}</h2>

      {current.type === "options" && (
        <div style={styles.grid}>
          {current.options.map((opt) => (
            <div
              key={opt.value}
              style={styles.card}
              onClick={() => handleNext(opt.value)}
            >
              <div style={styles.emoji}>{opt.emoji}</div>
              <p>{opt.label}</p>
            </div>
          ))}
        </div>
      )}

      {current.type === "input" && (
        <div style={{ width: "100%", maxWidth: 420 }}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={current.placeholder}
            style={styles.input}
          />
          <button
            style={styles.primaryBtn}
            disabled={!inputValue.trim() || loading}
            onClick={() => handleNext(inputValue)}
          >
            {loading ? "Processing…" : "Continue →"}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#07111a,#0b1220)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    textAlign: "center",
  },
  step: { color: "#94a3b8", marginBottom: "8px" },
  title: { fontSize: "2rem", marginBottom: "32px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    maxWidth: "520px",
    width: "100%",
  },
  card: {
    padding: "20px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
  },
  emoji: { fontSize: "2rem", marginBottom: "8px" },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    marginBottom: "16px",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#2dd4bf,#5eead4)",
    color: "#041018",
    fontWeight: "600",
    cursor: "pointer",
  },
};
