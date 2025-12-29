import { motion } from "framer-motion";
import heroIllustration from "../assets/hero-illustration.JPG";

export default function Hero({ onPrimaryClick }) {
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
              <button className="cta primary" onClick={onPrimaryClick}>
                Get Started
              </button>
              <button
                className="cta ghost"
                onClick={() => document.getElementById("planner-section").scrollIntoView({ behavior: "smooth" })}
              >
                Open Planner
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
