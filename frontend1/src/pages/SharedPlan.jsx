import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LZString from 'lz-string';

export default function SharedPlan() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(code);
      const planData = JSON.parse(decompressed);
      setPlan(planData);
    } catch (err) {
      console.error('Decode error:', err);
      setError('Invalid or corrupted link');
    }
  }, [code]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <h2 style={styles.errorTitle}>{error}</h2>
          <p style={styles.errorText}>This link may be invalid or corrupted.</p>
          <button 
            onClick={() => navigate("/")}
            style={styles.homeBtn}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(45, 212, 191, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(45, 212, 191, 0.3)';
            }}
          >
            ← Go back to Sanchar
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.planBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>{plan.title}</h1>
          <div style={styles.badges}>
            <span style={styles.badge}>
              😊 {plan.mood || "Adventure"}
            </span>
            <span style={styles.badge}>
              💰 {plan.budget || "Moderate"}
            </span>
          </div>
        </div>

        <div style={styles.places}>
          {plan.places && plan.places.map((p, i) => (
            <div 
              key={i} 
              style={styles.placeCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(45, 212, 191, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
              }}
            >
              <div style={styles.placeHeader}>
                <span style={styles.placeNumber}>{i + 1}</span>
                <h3 style={styles.placeName}>{p.place_name}</h3>
              </div>
              <div style={styles.placeDetails}>
                <span style={styles.placeDetail}>📍 {p.distance_km} km away</span>
                {p.visit_time_hr && (
                  <span style={styles.placeDetail}>⏱️ {p.visit_time_hr}h visit</span>
                )}
              </div>
              {p.maps_url && (
                <a 
                  href={p.maps_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.mapsLink}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(45, 212, 191, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(45, 212, 191, 0.1)';
                  }}
                >
                  🗺️ Open in Google Maps
                </a>
              )}
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            🔗 View-only link · Powered by Sanchar AI
          </p>
          <button 
            onClick={() => navigate("/")}
            style={styles.tryButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 10px 30px rgba(45, 212, 191, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(45, 212, 191, 0.3)';
            }}
          >
            🚀 Create Your Own Plan
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    color: "#fff",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  planBox: {
    maxWidth: "800px",
    width: "100%"
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    marginBottom: "20px",
    background: "linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  badges: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  badge: {
    padding: "8px 16px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "20px",
    fontSize: "0.9rem",
    color: "#2dd4bf",
    fontWeight: "600",
  },
  places: {
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  placeCard: {
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
  },
  placeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "12px",
  },
  placeNumber: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    color: "#0f172a",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  placeName: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
  },
  placeDetails: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px",
    flexWrap: "wrap",
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
    borderRadius: "12px",
    color: "#2dd4bf",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  footer: {
    textAlign: "center",
    paddingTop: "40px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  footerText: {
    fontSize: "0.9rem",
    color: "#64748b",
    marginBottom: "24px",
  },
  tryButton: {
    padding: "16px 32px",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    border: "none",
    borderRadius: "50px",
    fontWeight: "700",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(45, 212, 191, 0.3)",
  },
  errorBox: {
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    padding: "60px 40px",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    maxWidth: "500px",
  },
  errorIcon: {
    fontSize: "4rem",
    display: "block",
    marginBottom: "20px",
  },
  errorTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#EF4444",
  },
  errorText: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    marginBottom: "30px",
  },
  homeBtn: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    border: "none",
    borderRadius: "50px",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(45, 212, 191, 0.3)",
  },
  loadingBox: {
    textAlign: "center",
    padding: "60px 40px",
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
  loadingText: {
    fontSize: "1.2rem",
    color: "#cbd5e1",
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
