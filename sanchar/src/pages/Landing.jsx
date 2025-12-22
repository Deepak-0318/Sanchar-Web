function Landing({onStart}) {
  return (
    <div style={styles.container}>
      <h1 style={styles.logo}>Sanchar</h1>

      <p style={styles.tagline}>Plan less. Hang out more.</p>

      <p style={styles.subtitle}>
        Get a personalized hangout plan in seconds.
      </p>

      <button style={styles.cta} onClick={onStart}>Plan My Hangout</button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "24px",
  },
  logo: {
    fontSize: "48px",
    fontWeight: "700",
    marginBottom: "12px",
  },
  tagline: {
    fontSize: "20px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#4B5563",
    marginBottom: "24px",
  },
  cta: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#0F766E",
    color: "#ffffff",
    borderRadius: "8px",
  },
};

export default Landing;
