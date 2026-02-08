import { useState, useEffect } from "react";

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [visibleFeatures, setVisibleFeatures] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleFeatures(prev => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.feature-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section style={styles.section} id="features">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.badge}>🚀 Powerful Features</span>
          <h2 style={styles.title}>Why Adventurers Love Sanchar</h2>
          <p style={styles.subtitle}>
            Discover the magic behind perfect hangout planning 🎯
          </p>
        </div>

        <div style={styles.grid}>
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className="feature-card"
              style={{
                ...styles.card,
                ...(visibleFeatures.includes(index) ? styles.visible : styles.hidden),
                ...(index === activeFeature ? styles.activeCard : {})
              }}
              onClick={() => setActiveFeature(index)}
            >
              <div style={styles.cardIcon}>{feature.icon}</div>
              <h3 style={styles.cardTitle}>{feature.title}</h3>
              <p style={styles.cardDescription}>{feature.shortDesc}</p>
              <div style={styles.cardStats}>
                <span style={styles.stat}>{feature.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Recommendations",
    shortDesc: "Smart suggestions based on your preferences",
    stat: "95% accuracy"
  },
  {
    icon: "🔍",
    title: "Hidden Gems Discovery",
    shortDesc: "Find secret spots locals love",
    stat: "500+ gems"
  },
  {
    icon: "⚡",
    title: "Instant Planning",
    shortDesc: "Get plans ready in seconds",
    stat: "<10 seconds"
  },
  {
    icon: "🎯",
    title: "Mood-Based Matching",
    shortDesc: "Plans that match your exact vibe",
    stat: "12 moods"
  },
  {
    icon: "💰",
    title: "Budget Optimization",
    shortDesc: "Maximum fun within your budget",
    stat: "₹200-2000"
  },
  {
    icon: "📱",
    title: "Mobile-First Experience",
    shortDesc: "Plan and navigate on the go",
    stat: "100% mobile"
  }
];

const styles = {
  section: {
    padding: "120px 20px",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    color: "#ffffff",
    position: "relative",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  card: {
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    transition: "all 0.5s ease",
    cursor: "pointer",
    textAlign: "center",
  },
  visible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  hidden: {
    opacity: 0,
    transform: "translateY(30px)",
  },
  activeCard: {
    border: "2px solid rgba(45, 212, 191, 0.4)",
    boxShadow: "0 25px 50px rgba(45, 212, 191, 0.1)",
  },
  cardIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "1.3rem",
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
  cardStats: {
    textAlign: "center",
  },
  stat: {
    padding: "8px 16px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "20px",
    fontSize: "0.9rem",
    color: "#2dd4bf",
    fontWeight: "600",
  },
};