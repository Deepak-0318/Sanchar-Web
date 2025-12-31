import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------- SAFE REDIRECT ---------- */
  useEffect(() => {
    if (!location.state) navigate("/");
  }, [location.state, navigate]);

  if (!location.state) return null;

  const {
    mood,
    budget,
    time,
    location: startLocation,
    start_lat,
    start_lon,
  } = location.state;

  /* ---------- STATE ---------- */
  const [plan, setPlan] = useState({
    narration: "Generating your personalized hangout plan… ✨",
    itinerary: [],
  });

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Hi! I’ll help you refine this plan." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------- INIT ---------- */
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const startRes = await fetch(`${API_BASE}/chat/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start_lat,
            start_lon,
            mood,
            budget,
            time,
            start_location: startLocation,
          }),
        });

        const { session_id } = await startRes.json();
        if (!mounted) return;

        setSessionId(session_id);

        const chatRes = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id,
            message: "Generate initial optimized hangout plan",
          }),
        });

        const data = await chatRes.json();
        if (!mounted) return;

        setPlan({
          narration: data.narration,
          itinerary: data.optimized_plan || [],
        });

        setMessages((m) => [
          ...m,
          { role: "assistant", text: "✅ Your plan is ready!" },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: "⚠️ Failed to generate plan." },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => (mounted = false);
  }, []);

  /* ---------- CHAT ---------- */
  const sendMessage = async () => {
    if (!input.trim() || loading || !sessionId) return;

    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });

      const data = await res.json();

      if (data.optimized_plan) {
        setPlan({
          narration: data.narration,
          itinerary: data.optimized_plan,
        });

        setMessages((m) => [
          ...m,
          { role: "assistant", text: "🔁 Plan updated!" },
        ]);
      } else if (data.ask) {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: data.ask },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Unable to update plan." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <h1>Generated Plan</h1>
        <div style={styles.narration}>{plan.narration}</div>

        {plan.itinerary.map((p, i) => (
          <div key={i} style={styles.card}>
            <h3>{p.place_name}</h3>
            <p>📍 {p.category}</p>
            <p>⏱ {p.visit_time_hr} hrs</p>
            <p>📏 {p.distance_km} km</p>
          </div>
        ))}
      </div>

      <div style={styles.right}>
        <h2>Chatbot</h2>

        <div style={styles.chatShell}>
          <div style={styles.chatMessages}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={m.role === "user" ? styles.chatUser : styles.chatAssistant}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={styles.chatInputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={loading ? "Processing…" : "Suggest changes…"}
              style={styles.chatInput}
            />
            <button onClick={sendMessage} disabled={loading} style={styles.sendBtn}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

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
    display: "flex",
    flexDirection: "column",
  },
  narration: {
    background: "#2dd4bf",
    color: "#041018",
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "24px",
    maxWidth: "520px",
  },
  itinerary: { display: "grid", gap: "16px", maxWidth: "520px" },
  card: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
  },
  placeholder: { color: "#94a3b8", fontStyle: "italic" },
  chatShell: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "16px",
  },
  chatMessages: { display: "flex", flexDirection: "column", gap: "12px" },
  chatAssistant: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "12px",
  },
  chatUser: {
    alignSelf: "flex-end",
    background: "#2dd4bf",
    color: "#041018",
    padding: "12px",
    borderRadius: "12px",
  },
  chatInputRow: { display: "flex", gap: "8px", marginTop: "12px" },
  chatInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  sendBtn: {
    padding: "0 16px",
    borderRadius: "10px",
    border: "none",
    background: "#2dd4bf",
    cursor: "pointer",
  },
};
