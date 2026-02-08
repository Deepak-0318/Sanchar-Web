import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LZString from 'lz-string';

const API_BASE = "http://localhost:8000";
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
    { role: "assistant", text: "👋 Generating your perfect plan…" },
  ]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchRadius, setSearchRadius] = useState(2.0);
  const [totalPlacesFound, setTotalPlacesFound] = useState(0);
  const [chatType, setChatType] = useState("normal");
  const [userInterests, setUserInterests] = useState(null);
  const [ngrokUrl, setNgrokUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    if (window.location.hostname.includes('ngrok.io') || window.location.hostname.includes('ngrok-free.app')) {
      setNgrokUrl(window.location.origin);
    } else {
      setNgrokUrl('https://fb83-2401-4900-8839-fd67-111b-58bd-2500-5e7d.ngrok-free.app');
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
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
            weather,
            use_intelligent_chat: true
          }),
        });

        const data = await chatRes.json();
        const itinerary = (data.optimized_plan || []).slice(0, 5);

        if (data.chat_type) {
          setChatType(data.chat_type);
          if (data.interests) {
            setUserInterests(data.interests);
          }
        }

        if (data.search_info) {
          setSearchRadius(data.search_info.radius_used || data.search_info.search_radius || 2.0);
          setTotalPlacesFound(data.search_info.total_found || data.search_info.total_places_found || 0);
        }

        const totalTime = itinerary.reduce((sum, p) => sum + p.visit_time_hr, 0);
        const totalDistance = itinerary.reduce((sum, p) => sum + p.distance_km, 0);

        setPlan({
          narration: data.narration,
          itinerary,
          totalTime,
          totalDistance,
        });

        setMessages([{ role: "assistant", text: data.narration || "Your plan is ready! Ask me anything about it or request changes." }]);
      } catch {
        setMessages([{ role: "assistant", text: "Failed to generate plan." }]);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const handleSharePlan = async () => {
    if (!plan || saving) return;

    setSaving(true);

    try {
      const planData = {
        title: "My Hangout Plan",
        mood: mood || "chill",
        budget: budget || "moderate",
        places: plan.itinerary || [],
      };
      
      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(planData));
      const link = `${ngrokUrl}/plan/${compressed}`;

      setShareLink(link);
      setShowShareModal(true);
    } catch (error) {
      console.error('Share error:', error);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Failed to generate share link." },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      setTimeout(() => btn.innerHTML = originalHTML, 1000);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !sessionId || chatLoading) return;

    const userMessage = userInput.trim();
    setUserInput("");
    setChatLoading(true);

    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setMessages(prev => [...prev, { role: "assistant", text: "...", isTyping: true }]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
          preferred_location: preferredLocation,
          use_intelligent_chat: true
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      
      setMessages(prev => prev.filter(m => !m.isTyping));
      
      if (data.chat_type) {
        setChatType(data.chat_type);
        if (data.interests) {
          setUserInterests(data.interests);
        }
      }
      
      if (data.optimized_plan && data.optimized_plan.length > 0) {
        const itinerary = data.optimized_plan.slice(0, 5);
        const totalTime = itinerary.reduce((sum, p) => sum + p.visit_time_hr, 0);
        const totalDistance = itinerary.reduce((sum, p) => sum + p.distance_km, 0);
        
        setPlan({
          narration: data.narration,
          itinerary,
          totalTime,
          totalDistance
        });
        
        if (data.search_info) {
          setSearchRadius(data.search_info.radius_used || data.search_info.search_radius || searchRadius);
          setTotalPlacesFound(data.search_info.total_found || data.search_info.total_places_found || 0);
        }
      }

      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: data.narration || "Request processed successfully!" 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: "Sorry, I couldn't process that request. Please try again." 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {showShareModal && (
        <div style={styles.modalOverlay} onClick={() => setShowShareModal(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowShareModal(false)} 
              style={styles.closeBtn}
            >
              ✕
            </button>
            
            <h3 style={styles.modalTitle}>🔗 Share Your Plan</h3>
            
            <div style={styles.linkContainer}>
              <div style={styles.linkBox}>
                <span style={styles.linkText}>{shareLink}</span>
                <button 
                  id="copy-btn"
                  onClick={handleCopyLink} 
                  style={styles.copyBtn}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.left}>
        <div style={styles.header}>
          <button 
            style={styles.backBtn}
            onClick={() => navigate("/")}
          >
            ← Back
          </button>
          <h1 style={styles.title}>✨ Your Perfect Plan</h1>
          <div style={styles.badges}>
            <span style={styles.badge}>😊 {mood}</span>
            <span style={styles.badge}>💰 {budget}</span>
            <span style={styles.badge}>⏰ {time}</span>
          </div>
        </div>

        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Creating your adventure...</p>
          </div>
        )}

        {plan && (
          <>
            <div style={styles.planStats}>
              <div style={styles.stat}>
                <span style={styles.statIcon}>📍</span>
                <div>
                  <div style={styles.statValue}>{plan.itinerary.length}</div>
                  <div style={styles.statLabel}>Places</div>
                </div>
              </div>
              <div style={styles.stat}>
                <span style={styles.statIcon}>⏱️</span>
                <div>
                  <div style={styles.statValue}>{plan.totalTime.toFixed(1)}h</div>
                  <div style={styles.statLabel}>Duration</div>
                </div>
              </div>
              <div style={styles.stat}>
                <span style={styles.statIcon}>🚗</span>
                <div>
                  <div style={styles.statValue}>{plan.totalDistance.toFixed(1)}km</div>
                  <div style={styles.statLabel}>Distance</div>
                </div>
              </div>
            </div>

            <div style={styles.placesContainer}>
              {plan.itinerary.map((p, i) => (
                <div key={i} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.placeNumber}>{i + 1}</span>
                    <h3 style={styles.placeName}>{p.place_name}</h3>
                  </div>
                  <div style={styles.placeDetails}>
                    <span style={styles.placeDetail}>📍 {p.distance_km} km</span>
                    {p.visit_time_hr && (
                      <span style={styles.placeDetail}>⏱️ {p.visit_time_hr}h</span>
                    )}
                  </div>
                  {p.maps_url && (
                    <a 
                      href={p.maps_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.mapsLink}
                    >
                      🗺️ Open in Maps
                    </a>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSharePlan}
              disabled={saving}
              style={styles.shareBtn}
            >
              {saving ? "Generating link…" : "🔗 Share this plan"}
            </button>
          </>
        )}
      </div>

      {showChat && (
        <div style={styles.chatPopup}>
          <div style={styles.chatPopupHeader}>
            <h3 style={styles.chatPopupTitle}>🤖 SancharAI</h3>
            <button 
              onClick={() => setShowChat(false)} 
              style={styles.chatCloseBtn}
            >
              ✕
            </button>
          </div>
          {chatType === "follow_up" && (
            <div style={styles.chatStatus}>
              🤔 I need more details to find perfect places for you
            </div>
          )}
          {chatType === "negation" && (
            <div style={styles.chatStatus}>
              🔄 Let me find different options for you
            </div>
          )}
          {chatType === "recommendations" && (
            <div style={styles.chatStatus}>
              ✨ Found great matches based on your preferences!
            </div>
          )}
          <div style={styles.chatShell}>
            <div style={styles.messagesContainer}>
              {messages.map((m, i) => (
                <div key={i} style={m.role === "user" ? styles.chatUser : m.isTyping ? styles.chatTyping : styles.chatAssistant}>
                  {m.role === "assistant" && !m.isTyping && <span style={styles.botIcon}>🤖</span>}
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
            
            <div style={styles.inputContainer}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about your plan or request changes..."
                style={styles.chatInput}
                disabled={chatLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading || !userInput.trim()}
                style={styles.sendBtn}
              >
                {chatLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showChat && (
        <button 
          onClick={() => setShowChat(true)} 
          style={styles.chatToggleBtn}
        >
          🤖
        </button>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#fff",
    position: "relative",
  },
  left: {
    padding: "32px",
    overflowY: "auto",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  backBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    background: "transparent",
    color: "#cbd5e1",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "16px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    marginBottom: "16px",
    background: "linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "6px 12px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "15px",
    fontSize: "0.85rem",
    color: "#2dd4bf",
    fontWeight: "600",
  },
  loadingState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(45, 212, 191, 0.2)",
    borderTop: "4px solid #2dd4bf",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px auto",
  },
  loadingText: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
  },
  planStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "32px",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#2dd4bf",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  placesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  placeNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    color: "#0f172a",
    fontSize: "1rem",
    flexShrink: 0,
  },
  placeName: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
  },
  placeDetails: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px",
  },
  placeDetail: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  mapsLink: {
    display: "inline-block",
    marginTop: "8px",
    padding: "8px 16px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "10px",
    color: "#2dd4bf",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  shareBtn: {
    padding: "14px 22px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(45, 212, 191, 0.3)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalBox: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    border: "2px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "20px",
    padding: "32px",
    maxWidth: "600px",
    width: "90%",
    position: "relative",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
    padding: "4px 8px",
  },
  modalTitle: {
    color: "#2dd4bf",
    marginBottom: "24px",
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  linkContainer: {
    border: "2px solid rgba(45, 212, 191, 0.2)",
    borderRadius: "12px",
    padding: "16px",
    background: "rgba(45, 212, 191, 0.05)",
  },
  linkBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  linkText: {
    flex: 1,
    color: "#cbd5e1",
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  copyBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    border: "none",
    background: "#2dd4bf",
    color: "#0f172a",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatPopup: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "400px",
    height: "650px",
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "20px",
    border: "2px solid rgba(45, 212, 191, 0.3)",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
  },
  chatPopupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  chatPopupTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#2dd4bf",
    margin: 0,
  },
  chatCloseBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "20px",
    cursor: "pointer",
    padding: "4px 8px",
    transition: "all 0.3s ease",
  },
  chatToggleBtn: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(45, 212, 191, 0.4)",
    transition: "all 0.3s ease",
    zIndex: 1000,
  },
  chatStatus: {
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "12px",
    padding: "10px",
    margin: "12px 16px",
    fontSize: "0.9rem",
    color: "#2dd4bf",
    textAlign: "center",
    fontWeight: "500",
  },
  chatShell: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    overflow: "hidden",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  chatAssistant: {
    background: "rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "start",
    gap: "8px",
    maxWidth: "85%",
  },
  botIcon: {
    fontSize: "1.2rem",
    flexShrink: 0,
  },
  chatTyping: {
    background: "rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "12px",
    animation: "pulse 1.5s ease-in-out infinite",
    maxWidth: "85%",
  },
  chatUser: {
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    padding: "12px",
    borderRadius: "12px",
    marginLeft: "auto",
    maxWidth: "85%",
    fontWeight: "500",
  },
  inputContainer: {
    display: "flex",
    gap: "8px",
  },
  chatInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    outline: "none",
    fontSize: "1rem",
  },
  sendBtn: {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "1rem",
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
