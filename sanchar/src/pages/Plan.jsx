function Plan({ plan, onBack }) {
  return (
    <div style={styles.container}>
      <h2>Your Hangout Plan</h2>

      <div style={styles.meta}>
        {plan.time} • {plan.budget} • {plan.mood}
      </div>

      {plan.places.map((place, index) => (
        <div key={index} style={styles.card}>
          <h3>{place.name}</h3>
          <p style={styles.reason}>{place.reason}</p>
          <div style={styles.details}>
            ⏰ {place.time} &nbsp; 💰 {place.cost}
          </div>
        </div>
      ))}

      <button style={styles.secondary} onClick={onBack}>
        Plan Again
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "24px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  meta: {
    marginBottom: "16px",
    color: "#6B7280",
  },
  card: {
    padding: "16px",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    marginBottom: "12px",
  },
  reason: {
    color: "#374151",
    marginBottom: "8px",
  },
  details: {
    fontSize: "14px",
    color: "#6B7280",
  },
  secondary: {
    marginTop: "24px",
    padding: "12px",
    backgroundColor: "#E5E7EB",
    borderRadius: "8px",
    width: "100%",
  },
};

export default Plan;
