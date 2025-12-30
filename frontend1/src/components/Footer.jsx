export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        {/* Brand */}
        <div style={styles.brand}>
          <h3 style={styles.logo}>Sanchar AI</h3>
          <p style={styles.tagline}>
            Plan less. Hangout more.
          </p>
        </div>

        {/* Links */}
        <div style={styles.links}>
          <a href="#" style={styles.link}>Home</a>
          <a href="#" style={styles.link}>Planner</a>
          <a href="#" style={styles.link}>Hidden Gems</a>
          <a href="#" style={styles.link}>Contact</a>
        </div>

        {/* Social */}
        <div style={styles.social}>
          <span style={styles.socialIcon}>🐦</span>
          <span style={styles.socialIcon}>📸</span>
          <span style={styles.socialIcon}>💼</span>
        </div>
      </div>

      <div style={styles.bottom}>
        © {new Date().getFullYear()} Sanchar AI. All rights reserved.
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    padding: "80px 20px 40px",
    background: "linear-gradient(180deg, #020617, #020617)",
    color: "#ffffff",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: "40px",
    alignItems: "center",
  },
  brand: {
    maxWidth: "320px",
  },
  logo: {
    margin: 0,
    fontSize: "1.6rem",
    fontWeight: "700",
  },
  tagline: {
    marginTop: "8px",
    fontSize: "0.95rem",
    color: "#94a3b8",
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    color: "#cbd5f5",
    fontSize: "0.95rem",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },
  social: {
    display: "flex",
    gap: "14px",
    fontSize: "1.3rem",
    cursor: "pointer",
  },
  socialIcon: {
    opacity: 0.8,
    transition: "transform 0.2s ease, opacity 0.2s ease",
  },
  bottom: {
    marginTop: "50px",
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#64748b",
  },
};
