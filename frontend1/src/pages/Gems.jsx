import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHiddenGemsByLocation } from "../services/chatApi";

export default function Gems() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(false);

  const explore = async () => {
    if (!location.trim()) return;

    setLoading(true);
    try {
      const data = await fetchHiddenGemsByLocation(location);
      setGems(data);
    } catch (e) {
      console.error(e);
      setGems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button 
          style={styles.backBtn}
          onClick={() => navigate("/")}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(45, 212, 191, 0.1)';
            e.target.style.borderColor = '#2dd4bf';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          ← Back to Home
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.emoji}>💎</span>
            Discover Hidden Gems
          </h1>
          <p style={styles.subtitle}>
            Explore secret spots and local favorites in Bengaluru & Ramanagara
          </p>
        </div>

        <div style={styles.searchBox}>
          <div style={styles.inputWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              placeholder="Enter location (e.g., Jayanagar, MG Road, Ramanagara)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && explore()}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#2dd4bf';
                e.target.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(45, 212, 191, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={explore}
              disabled={loading || !location.trim()}
              style={{
                ...styles.exploreBtn,
                ...(loading || !location.trim() ? styles.disabledBtn : {})
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(45, 212, 191, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(45, 212, 191, 0.3)';
                }
              }}
            >
              {loading ? (
                <span style={styles.loadingText}>
                  <span style={styles.spinner}></span>
                  Searching...
                </span>
              ) : (
                "✨ Explore"
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingMessage}>Finding hidden gems near {location}...</p>
          </div>
        )}

        {!loading && gems.length === 0 && location && (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔍</span>
            <h3 style={styles.emptyTitle}>No gems found nearby</h3>
            <p style={styles.emptyText}>
              Try searching for nearby areas or popular locations like Koramangala, Indiranagar, or Ramanagara
            </p>
          </div>
        )}

        {!loading && gems.length > 0 && (
          <div style={styles.results}>
            <div style={styles.resultsHeader}>
              <h2 style={styles.resultsTitle}>
                Found {gems.length} hidden gem{gems.length !== 1 ? 's' : ''} near {location}
              </h2>
            </div>
            <div style={styles.grid}>
              {gems.map((g, i) => (
                <div
                  key={i}
                  style={styles.card}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(45, 212, 191, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <div style={styles.cardHeader}>
                    <span style={styles.cardNumber}>{i + 1}</span>
                    <span style={styles.cardDistance}>📍 {g.distance_km} km</span>
                  </div>
                  <h3 style={styles.cardTitle}>{g.place_name}</h3>
                  <p style={styles.cardDescription}>
                    {g.famous_for || g.why_famous || "A hidden gem worth exploring"}
                  </p>
                  <div style={styles.cardFooter}>
                    <span style={styles.badge}>✨ Hidden Gem</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    color: "#ffffff",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  backBtn: {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    background: "transparent",
    color: "#cbd5e1",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "40px",
  },
  header: {
    textAlign: "center",
    marginBottom: "60px",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "800",
    marginBottom: "16px",
    background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },
  emoji: {
    fontSize: "3rem",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  searchBox: {
    maxWidth: "800px",
    margin: "0 auto 60px auto",
  },
  inputWrapper: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "8px",
    border: "2px solid rgba(45, 212, 191, 0.2)",
  },
  searchIcon: {
    fontSize: "1.5rem",
    marginLeft: "16px",
  },
  input: {
    flex: 1,
    padding: "16px",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "1.1rem",
    outline: "none",
    transition: "all 0.3s ease",
  },
  exploreBtn: {
    padding: "16px 32px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(45, 212, 191, 0.3)",
    whiteSpace: "nowrap",
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none !important",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid #0f172a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingState: {
    textAlign: "center",
    padding: "80px 20px",
  },
  loadingSpinner: {
    width: "60px",
    height: "60px",
    border: "4px solid rgba(45, 212, 191, 0.2)",
    borderTop: "4px solid #2dd4bf",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 24px auto",
  },
  loadingMessage: {
    fontSize: "1.2rem",
    color: "#cbd5e1",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "24px",
    border: "2px dashed rgba(255, 255, 255, 0.1)",
  },
  emptyIcon: {
    fontSize: "4rem",
    display: "block",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#ffffff",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  results: {
    marginTop: "60px",
  },
  resultsHeader: {
    marginBottom: "40px",
    textAlign: "center",
  },
  resultsTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#2dd4bf",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "30px",
  },
  card: {
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardNumber: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    color: "#0f172a",
    fontSize: "1.2rem",
  },
  cardDistance: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#ffffff",
  },
  cardDescription: {
    fontSize: "1rem",
    color: "#cbd5e1",
    lineHeight: 1.6,
    marginBottom: "20px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
