export default function HowItWorks() {
  return (
    <section style={styles.section}>
      <h2 style={styles.title}>How Sanchar Works</h2>
      <p style={styles.subtitle}>
        Three simple steps to plan perfect hangouts.
      </p>

      <div style={styles.cardGrid}>
        {steps.map((step, index) => (
          <div
            key={index}
            style={styles.card}
            className="how-card"
          >
            <div style={styles.icon}>{step.icon}</div>
            <h3 style={styles.cardTitle}>{step.title}</h3>
            <p style={styles.cardText}>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  {
    icon: "🎯",
    title: "Tell your vibe",
    text: "Share your mood, budget, time, and location.",
  },
  {
    icon: "🤖",
    title: "AI plans it",
    text: "Sanchar AI finds hidden gems and builds the perfect plan.",
  },
  {
    icon: "🚀",
    title: "Go & hang out",
    text: "Follow the plan, explore new places, and enjoy.",
  },
];

const styles = {
  section: {
    padding: "100px 20px",
    textAlign: "center",
    background: "linear-gradient(180deg, #0b1220, #020617)",
    color: "#ffffff",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: "700",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#94a3b8",
    marginBottom: "56px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "28px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  card: {
    padding: "34px 28px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 25px 45px rgba(0,0,0,0.4)",
    transition: "all 0.35s ease",
    cursor: "default",
  },
  icon: {
    fontSize: "2.6rem",
    marginBottom: "18px",
    transition: "transform 0.35s ease, filter 0.35s ease",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "10px",
  },
  cardText: {
    fontSize: "1rem",
    color: "#cbd5f5",
    lineHeight: 1.6,
  },
};
