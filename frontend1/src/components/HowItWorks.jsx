import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleCards(prev => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('.step-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section style={styles.section} id="how-it-works">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.badge}>✨ Simple Process</span>
          <h2 style={styles.title}>How Sanchar Works</h2>
          <p style={styles.subtitle}>
            From idea to adventure in just three magical steps 🎯
          </p>
        </div>

        <div style={styles.timeline}>
          {steps.map((step, index) => (
            <div
              key={index}
              data-index={index}
              className="step-card"
              style={{
                ...styles.stepContainer,
                ...(visibleCards.includes(index) ? styles.visible : styles.hidden)
              }}
            >
              <div style={styles.stepNumber}>{index + 1}</div>
              <div 
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(45, 212, 191, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 25px 45px rgba(0,0,0,0.4)';
                }}
              >
                <div style={styles.iconContainer}>
                  <span style={styles.icon}>{step.icon}</span>
                  <div style={styles.iconGlow}></div>
                </div>
                <h3 style={styles.cardTitle}>{step.title}</h3>
                <p style={styles.cardText}>{step.text}</p>
                <div style={styles.features}>
                  {step.features.map((feature, i) => (
                    <span key={i} style={styles.feature}>{feature}</span>
                  ))}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div style={styles.connector}>
                  <div style={styles.arrow}>→</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.cta}>
          <div style={styles.ctaCard}>
            <h3 style={styles.ctaTitle}>Ready to start your adventure? 🚀</h3>
            <p style={styles.ctaText}>Join thousands who've discovered Bengaluru's hidden gems</p>
            <button 
              style={styles.ctaButton}
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
              🎯 Try Sanchar Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: "🎯",
    title: "Tell Your Vibe",
    text: "Share your mood, budget, time, and dream location with our AI",
    features: ["🕐 Time preference", "💰 Budget range", "📍 Location", "😊 Mood"]
  },
  {
    icon: "🤖",
    title: "AI Magic Happens",
    text: "Our intelligent system discovers hidden gems and crafts your perfect plan",
    features: ["🔍 Hidden gems", "⚡ Instant planning", "🎨 Personalized", "📊 Smart matching"]
  },
  {
    icon: "🚀",
    title: "Adventure Awaits",
    text: "Follow your custom plan, explore amazing places, and create memories",
    features: ["🗺️ Easy navigation", "📱 Mobile friendly", "📸 Share moments", "⭐ Rate experiences"]
  },
];

const styles = {
  section: {
    padding: "120px 20px",
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "80px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 20px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "25px",
    fontSize: "0.9rem",
    color: "#2dd4bf",
    marginBottom: "20px",
    fontWeight: "600",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "800",
    marginBottom: "16px",
    background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#cbd5e1",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "60px",
    position: "relative",
  },
  stepContainer: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
    position: "relative",
    transition: "all 0.8s ease",
  },
  visible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  hidden: {
    opacity: 0,
    transform: "translateY(50px)",
  },
  stepNumber: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#0f172a",
    flexShrink: 0,
    boxShadow: "0 10px 30px rgba(45, 212, 191, 0.3)",
  },
  card: {
    flex: 1,
    padding: "40px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  iconContainer: {
    position: "relative",
    display: "inline-block",
    marginBottom: "20px",
  },
  icon: {
    fontSize: "3rem",
    display: "block",
    position: "relative",
    zIndex: 2,
  },
  iconGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80px",
    height: "80px",
    background: "radial-gradient(circle, rgba(45, 212, 191, 0.2) 0%, transparent 70%)",
    borderRadius: "50%",
    zIndex: 1,
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#ffffff",
  },
  cardText: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    lineHeight: 1.6,
    marginBottom: "20px",
  },
  features: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  feature: {
    padding: "6px 12px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.2)",
    borderRadius: "15px",
    fontSize: "0.85rem",
    color: "#2dd4bf",
    fontWeight: "500",
  },
  connector: {
    position: "absolute",
    right: "-20px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
  },
  arrow: {
    fontSize: "2rem",
    color: "#2dd4bf",
    animation: "pulse 2s ease-in-out infinite",
  },
  cta: {
    marginTop: "80px",
    textAlign: "center",
  },
  ctaCard: {
    padding: "40px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(94, 234, 212, 0.05) 100%)",
    border: "1px solid rgba(45, 212, 191, 0.2)",
    maxWidth: "600px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#ffffff",
  },
  ctaText: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    marginBottom: "24px",
  },
  ctaButton: {
    padding: "16px 32px",
    borderRadius: "50px",
    border: "none",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 30px rgba(45, 212, 191, 0.3)",
  },
};