import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

  const [sessionId, setSessionId] = useState(null);
  const [plan, setPlan] = useState(null);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Generating your plan…" },
  ]);
  const [loading, setLoading] = useState(true);

  /* START SESSION + GENERATE PLAN */
  useEffect(() => {
    async function init() {
      try {
        const startRes = await fetch(`${API_BASE}/chat/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ start_lat, start_lon }),
        });

        const { session_id } = await startRes.json();
        setSessionId(session_id);

        const chatRes = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id,
            message: `${mood}, ${budget}, ${time}`,
            start_location: startLocation,
            preferred_location: preferredLocation,
          }),
        });

        const data = await chatRes.json();

        setPlan({
          narration: data.narration,
          itinerary: (data.optimized_plan || []).slice(0, 5), // 🔒 EXACTLY 5
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

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <h1>Generated Plan</h1>

        {loading && <p>Loading…</p>}

        {plan && (
          <>
            <div style={styles.narration}>{plan.narration}</div>

            {plan.itinerary.map((p, i) => (
              <div key={i} style={styles.card}>
                <h3>{p.place_name}</h3>
                <p>📍 {p.category}</p>
                <p>⏱ {p.visit_time_hr} hrs</p>
                <p>📏 {p.distance_km} km</p>
              </div>
            ))}
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
