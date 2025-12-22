function Loading() {
  return (
    <div style={styles.container}>
      <h2>Creating your hangout plan…</h2>

      <p style={styles.text}>Finding great places</p>
      <p style={styles.text}>Optimizing route</p>
      <p style={styles.text}>Checking weather</p>

      <div style={styles.spinner} />
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
    gap: "8px",
  },
  text: {
    color: "#6B7280",
  },
  spinner: {
    marginTop: "16px",
    width: "40px",
    height: "40px",
    border: "4px solid #E5E7EB",
    borderTop: "4px solid #0F766E",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default Loading;
