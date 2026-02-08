import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Newsletter Section */}
        {/* <div style={styles.newsletter}>
          <div style={styles.newsletterContent}>
            <h3 style={styles.newsletterTitle}>
              🌟 Get Weekly Adventure Ideas
            </h3>
            <p style={styles.newsletterText}>
              Discover new hidden gems and exclusive hangout spots in Bengaluru every week!
            </p>
            <form style={styles.newsletterForm} onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email for adventure updates..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.emailInput}
                required
              />
              <button 
                type="submit" 
                style={styles.subscribeBtn}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(45, 212, 191, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(45, 212, 191, 0.3)';
                }}
              >
                {subscribed ? "✅ Subscribed!" : "🚀 Subscribe"}
              </button>
            </form>
          </div>
        </div> */}

        {/* Main Footer Content */}
        <div style={styles.main}>
          {/* Brand Section */}
          <div style={styles.brand}>
            <h3 style={styles.logo}>🌴 Sanchar<span style={styles.logoAccent}>AI</span></h3>
            <p style={styles.tagline}>
              Your AI-powered adventure companion for discovering Bengaluru's best-kept secrets
            </p>
            <div style={styles.social}>
              <a 
                href="#" 
                style={styles.socialLink}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(45, 212, 191, 0.1)';
                  e.target.style.borderColor = 'rgba(45, 212, 191, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🐦 Twitter
              </a>
              <a 
                href="#" 
                style={styles.socialLink}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(45, 212, 191, 0.1)';
                  e.target.style.borderColor = 'rgba(45, 212, 191, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📸 Instagram
              </a>
              <a 
                href="#" 
                style={styles.socialLink}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(45, 212, 191, 0.1)';
                  e.target.style.borderColor = 'rgba(45, 212, 191, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                💼 LinkedIn
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div style={styles.links}>
            <h4 style={styles.linkTitle}>🎯 Quick Links</h4>
            <a href="#" style={styles.link}>🏠 Home</a>
            <a href="#how-it-works" style={styles.link}>⚡ How it Works</a>
            <a href="/planner" style={styles.link}>🗺️ Plan Now</a>
            <a href="#" style={styles.link}>🔍 Hidden Gems</a>
          </div>

          {/* Support */}
          <div style={styles.links}>
            <h4 style={styles.linkTitle}>🤝 Support</h4>
            <a href="#" style={styles.link}>❓ Help Center</a>
            <a href="#" style={styles.link}>📞 Contact Us</a>
            <a href="#" style={styles.link}>🔒 Privacy Policy</a>
            <a href="#" style={styles.link}>📋 Terms of Service</a>
            <a href="#" style={styles.link}>🐛 Report Bug</a>
          </div>
        </div>

        {/* Features Highlight */}
        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🤖</span>
            <div>
              <div style={styles.featureTitle}>AI-Powered</div>
              <div style={styles.featureText}>Smart recommendations</div>
            </div>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>⚡</span>
            <div>
              <div style={styles.featureTitle}>Instant Plans</div>
              <div style={styles.featureText}>Ready in seconds</div>
            </div>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🔍</span>
            <div>
              <div style={styles.featureTitle}>Hidden Gems</div>
              <div style={styles.featureText}>Discover unique spots</div>
            </div>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📱</span>
            <div>
              <div style={styles.featureTitle}>Mobile First</div>
              <div style={styles.featureText}>Plan on the go</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={styles.bottom}>
          <div style={styles.bottomLeft}>
            <p style={styles.copyright}>
              © {new Date().getFullYear()} Sanchar AI. Made with ❤️ in Bengaluru for adventure lovers.
            </p>
          </div>
          <div style={styles.bottomRight}>
            <span style={styles.badge}>🌟 Trusted by 10K+ adventurers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  newsletter: {
    padding: "60px 0",
    textAlign: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  newsletterContent: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  newsletterTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "12px",
    background: "linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  newsletterText: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    marginBottom: "30px",
    lineHeight: 1.6,
  },
  newsletterForm: {
    display: "flex",
    gap: "12px",
    maxWidth: "400px",
    margin: "0 auto",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emailInput: {
    flex: 1,
    minWidth: "250px",
    padding: "14px 20px",
    borderRadius: "25px",
    border: "2px solid rgba(45, 212, 191, 0.3)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease",
  },
  subscribeBtn: {
    padding: "14px 24px",
    borderRadius: "25px",
    border: "none",
    background: "linear-gradient(135deg, #2dd4bf, #5eead4)",
    color: "#0f172a",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 15px rgba(45, 212, 191, 0.3)",
  },
  main: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "50px",
    padding: "80px 0 60px 0",
  },
  brand: {
    maxWidth: "350px",
  },
  logo: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: "800",
    marginBottom: "16px",
    color: "#ffffff",
  },
  logoAccent: {
    color: "#2dd4bf",
  },
  tagline: {
    fontSize: "1rem",
    color: "#94a3b8",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  social: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
  },
  socialLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    padding: "8px 12px",
    borderRadius: "15px",
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  linkTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#2dd4bf",
  },
  link: {
    color: "#cbd5e1",
    fontSize: "0.95rem",
    textDecoration: "none",
    transition: "all 0.3s ease",
    padding: "4px 0",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
    padding: "60px 0",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  featureIcon: {
    fontSize: "2rem",
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "4px",
  },
  featureText: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "40px 0",
    flexWrap: "wrap",
    gap: "20px",
  },
  bottomLeft: {
    flex: 1,
  },
  copyright: {
    fontSize: "0.9rem",
    color: "#64748b",
    margin: 0,
  },
  bottomRight: {
    flex: "0 0 auto",
  },
  badge: {
    padding: "8px 16px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.3)",
    borderRadius: "20px",
    fontSize: "0.85rem",
    color: "#2dd4bf",
    fontWeight: "600",
  },
};