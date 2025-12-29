import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroIllustration from "../assets/hero-illustration.JPG";

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url(${heroIllustration})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="hero-overlay" />
      <div className="hero-inner">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-content"
        >
          <div>
            <h1 className="hero-title">
              Sanchar <span className="accent">AI</span>
            </h1>
            <p className="hero-tag">Plan less. Wander more.</p>

            <div className="hero-cta">
              <Link to="/planner" className="cta primary" style={{ textDecoration: "none", display: "inline-block" }}>
                Get Started
              </Link>
              <Link to="/planner" className="cta ghost" style={{ textDecoration: "none", display: "inline-block" }}>
                Open Planner
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
