import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const WEATHER_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) navigate("/");
  }, [location.state, navigate]);

  if (!location.state) return null;

  const {
    mood,
    budget,
    time,
    startLocation,
    preferredLocation,
    start_lat,
    start_lon,
  } = location.state;

  const [plan, setPlan] = useState(null);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Generating your plan…" },
  ]);
  const [loading, setLoading] = useState(true);

  const [shareLink, setShareLink] = useState(null);
  const [saving, setSaving] = useState(false);

  /* START SESSION + GENERATE PLAN */
  useEffect(() => {
    async function init() {
      try {
        /* 🌦 STEP 1: FETCH WEATHER */
        let weather = "clear";

        if (preferredLocation) {
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${preferredLocation}&appid=${WEATHER_KEY}`
          );
          const weatherData = await weatherRes.json();

          if (
            weatherData.weather &&
            weatherData.weather[0].main
              .toLowerCase()
              .includes("rain")
          ) {
            weather = "rainy";
          }
        }

        /* START SESSION */
        const startRes = await fetch(`${API_BASE}/chat/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ start_lat, start_lon }),
        });

        const { session_id } = await startRes.json();

        /* GENERATE PLAN */
        const chatRes = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id,
            message: `${mood}, ${budget}, ${time}`,
            start_location: startLocation,
            preferred_location: preferredLocation,
            weather, // ✅ SEND WEATHER
          }),
        });

        const data = await chatRes.json();
        const itinerary = (data.optimized_plan || []).slice(0, 5);

        /* TOTALS */
        const totalTime = itinerary.reduce(
          (sum, p) => sum + p.visit_time_hr,
          0
        );

        const totalDistance = itinerary.reduce(
          (sum, p) => sum + p.distance_km,
          0
        );

        setPlan({
          narration: data.narration,
          itinerary,
          totalTime,
          totalDistance,
        });

        setMessages([{ role: "assistant", text: "✅ Your plan is ready!" }]);
      } catch {
        setMessages([{ role: "assistant", text: "⚠️ Failed to generate plan." }]);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  /* SHARE PLAN */
  const handleSharePlan = async () => {
    if (!plan || saving) return;

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          budget,
          places: plan.itinerary.map((p) => ({
            name: p.place_name,
            category: p.category,
            visit_time_hr: p.visit_time_hr,
            distance_km: p.distance_km,
          })),
        }),
      });

      const data = await res.json();
      const link = `${window.location.origin}/plan/${data.shareCode}`;

      setShareLink(link);
      navigator.clipboard.writeText(link);

      setMessages((m) => [
        ...m,
        { role: "assistant", text: "🔗 Shareable link copied!" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Failed to generate share link." },
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <h1>Generated Plan</h1>

        {loading && <p>Loading…</p>}

        {plan && (
          <>
            <div style={styles.narration}>{plan.narration}</div>

            <p>⏱ Total Time: {plan.totalTime.toFixed(1)} hrs</p>
            <p>📏 Total Distance: {plan.totalDistance.toFixed(1)} km</p>

            {plan.itinerary.map((p, i) => (
              <div key={i} style={styles.card}>
                <h3>
                  {i + 1}. {p.place_name}
                </h3>
                <p>🏷 {p.category}</p>
                <p>⏱ {p.visit_time_hr} hrs</p>
                <p>📍 {p.distance_km} km away</p>
              </div>
            ))}

            <button
              onClick={handleSharePlan}
              disabled={saving}
              style={styles.shareBtn}
            >
              {saving ? "Generating link…" : "🔗 Share this plan"}
            </button>

            {shareLink && (
              <div style={styles.shareBox}>
                <a href={shareLink} target="_blank" rel="noreferrer">
                  {shareLink}
                </a>
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.right}>
        <h2>Chatbot</h2>
        <div style={styles.chatShell}>
          {messages.map((m, i) => (
            <div key={i} style={styles.chatAssistant}>
              {m.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* STYLES UNCHANGED */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(180deg,#07111a,#0b1220)",
    color: "#fff",
  },
  left: {
    flex: 1,
    padding: "32px",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  },
  right: {
    flex: 1,
    padding: "32px",
  },
  narration: {
    background: "#2dd4bf",
    color: "#041018",
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "24px",
    maxWidth: "520px",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
    maxWidth: "520px",
  },
  shareBtn: {
    marginTop: "20px",
    padding: "14px 22px",
    borderRadius: "14px",
    border: "none",
    background: "#22d3ee",
    color: "#041018",
    fontWeight: 600,
    cursor: "pointer",
  },
  shareBox: {
    marginTop: "16px",
    background: "rgba(255,255,255,0.08)",
    padding: "14px",
    borderRadius: "12px",
    maxWidth: "520px",
    wordBreak: "break-all",
  },
  chatShell: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "16px",
  },
  chatAssistant: {
    background: "rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "12px",
  },
};
