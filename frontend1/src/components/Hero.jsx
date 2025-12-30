import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate(); // ✅ initialize navigator

  return (
    <section style={styles.hero}>
      <h1 style={styles.title}>
        Plan less. <span style={styles.accent}>Hangout more.</span>
      </h1>

      <p style={styles.subtitle}>
        Sanchar AI helps you discover hidden gems and plan perfect hangouts
        in seconds.
      </p>

      <div style={styles.actions}>
        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/planner")}   // ✅ route to planner
        >
          Get Plan
        </button>

        <button
          style={styles.secondaryBtn}
          onClick={() => navigate("/gems")}      // ✅ route to gems
        >
          Explore Gems
        </button>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "0 20px",
    background: "linear-gradient(180deg, #07111a, #0b1220)",
    color: "#ffffff",
  },
  title: {
    fontSize: "3.2rem",
    fontWeight: "700",
    marginBottom: "16px",
  },
  accent: {
    color: "#2dd4bf",
  },
  subtitle: {
    maxWidth: "620px",
    fontSize: "1.15rem",
    color: "#94a3b8",
    marginBottom: "32px",
    lineHeight: 1.6,
  },
  actions: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  primaryBtn: {
    padding: "14px 26px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#2dd4bf,#5eead4)",
    color: "#041018",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "14px 26px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#ffffff",
    fontSize: "1rem",
    cursor: "pointer",
  },
};
