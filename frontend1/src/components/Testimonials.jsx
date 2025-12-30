export default function Testimonials() {
  return (
    <section style={styles.section}>
      <h2 style={styles.title}>What people say</h2>
      <p style={styles.subtitle}>
        Real hangouts. Real experiences.
      </p>

      <div style={styles.grid}>
        {testimonials.map((t, i) => (
          <div key={i} style={styles.card} className="testimonial-card">
            <div style={styles.header}>
              <div style={styles.avatar}>{t.initial}</div>
              <div>
                <div style={styles.name}>{t.name}</div>
                <div style={styles.place}>{t.place}</div>
              </div>
            </div>
            <p style={styles.text}>“{t.text}”</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  {
    initial: "A",
    name: "Ananya",
    place: "Bengaluru",
    text: "We discovered a lakeside café I never knew existed. Sanchar made the plan effortless.",
  },
  {
    initial: "R",
    name: "Rahul",
    place: "Mysuru",
    text: "Perfect for last-minute plans. The hidden gems feature is seriously good.",
  },
  {
    initial: "S",
    name: "Sneha",
    place: "Bengaluru",
    text: "No more endless Googling. Just tell the vibe and go.",
  },
];

const styles = {
  section: {
    padding: "100px 20px",
    background: "linear-gradient(180deg, #020617, #020617)",
    color: "#ffffff",
    textAlign: "center",
  },
  title: {
    fontSize: "2.3rem",
    fontWeight: "700",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#94a3b8",
    marginBottom: "56px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "28px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  card: {
    padding: "28px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    textAlign: "left",
    transition: "all 0.35s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "16px",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#2dd4bf,#5eead4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    color: "#041018",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  name: {
    fontWeight: "600",
    fontSize: "1rem",
  },
  place: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  text: {
    fontSize: "1rem",
    color: "#e5e7eb",
    lineHeight: 1.6,
  },
};
