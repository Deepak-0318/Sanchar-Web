import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Hero() {
  const navigate = useNavigate();
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const vacationEmojis = ['🏖️', '🏔️', '🌴', '🎡', '🎢', '🏛️'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % vacationEmojis.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-10px) scale(1.1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <section style={styles.hero}>
      <div style={styles.floatingElements}>
        <div style={{...styles.floatingIcon, ...styles.float1}}>✨</div>
        <div style={{...styles.floatingIcon, ...styles.float2}}>✈️</div>
        <div style={{...styles.floatingIcon, ...styles.float3}}>🎯</div>
        <div style={{...styles.floatingIcon, ...styles.float4}}>🗺️</div>
      </div>
      
      <div style={styles.heroContent}>
        <div style={styles.emojiContainer}>
          <span style={styles.rotatingEmoji}>{vacationEmojis[currentEmoji]}</span>
        </div>
        
        <h1 style={styles.title}>
          Your Perfect <span style={styles.accent}>Bengaluru Adventure</span> Awaits
        </h1>

        <p style={styles.subtitle}>
          From hidden cafes to scenic spots in Ramanagara - let Sanchar AI craft your ideal hangout plan in seconds. No more endless scrolling, just pure fun! 🎉
        </p>

<div style={styles.actions}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/get-started")}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 35px rgba(45, 212, 191, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(45, 212, 191, 0.3)';
            }}
          >
            🚀 Start Planning
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/gems")}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(45, 212, 191, 0.1)';
              e.target.style.borderColor = '#2dd4bf';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(45, 212, 191, 0.5)';
            }}
          >
            🔍 Explore Gems
          </button>
        </div>
        
        <div style={styles.trustBadge}>
          <span style={styles.trustText}>Trusted by adventure seekers across Bengaluru 💫</span>
        </div>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    minHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "0 20px",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  floatingIcon: {
    position: "absolute",
    fontSize: "2rem",
    opacity: 0.6,
    color: "#2dd4bf",
  },
  float1: {
    top: "20%",
    left: "10%",
    animation: "float 6s ease-in-out infinite",
  },
  float2: {
    top: "30%",
    right: "15%",
    animation: "float 8s ease-in-out infinite reverse",
  },
  float3: {
    bottom: "25%",
    left: "20%",
    animation: "float 7s ease-in-out infinite",
  },
  float4: {
    bottom: "35%",
    right: "10%",
    animation: "float 9s ease-in-out infinite reverse",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "800px",
  },
  emojiContainer: {
    marginBottom: "20px",
  },
  rotatingEmoji: {
    fontSize: "4rem",
    display: "inline-block",
    animation: "bounce 2s ease-in-out infinite",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: "800",
    marginBottom: "20px",
    lineHeight: 1.2,
    background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  accent: {
    background: "linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    maxWidth: "650px",
    fontSize: "1.25rem",
    color: "#cbd5e1",
    marginBottom: "40px",
    lineHeight: 1.7,
    margin: "0 auto 40px auto",
  },
  features: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "1rem",
    color: "#e2e8f0",
    padding: "10px 16px",
    background: "rgba(45, 212, 191, 0.1)",
    borderRadius: "25px",
    border: "1px solid rgba(45, 212, 191, 0.2)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "30px",
  },
  primaryBtn: {
    padding: "16px 32px",
    borderRadius: "50px",
    border: "none",
    background: "linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)",
    color: "#0f172a",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 30px rgba(45, 212, 191, 0.3)",
  },
  secondaryBtn: {
    padding: "16px 32px",
    borderRadius: "50px",
    border: "2px solid rgba(45, 212, 191, 0.5)",
    background: "transparent",
    color: "#ffffff",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  trustBadge: {
    marginTop: "20px",
  },
  trustText: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    fontStyle: "italic",
  },
};