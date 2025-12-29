import { motion } from "framer-motion";
// Use a photographic hero-style image for the first choice (public Unsplash URL)
import feat1 from "../assets/feature-1.JPG";
import feat2 from "../assets/feature-2.JPG";
import feat3 from "../assets/feature-3.JPG";
import feat4 from "../assets/feature-4.JPG";

const ITEMS = [
  { id: "gems", title: "Find Hidden Gems", img: feat1, desc: "Discover offbeat local spots" },
  { id: "hangout", title: "Hangout with Friends & Family", img: feat2, desc: "Plan group-friendly outings" },
  { id: "explore", title: "Explore New Places", img: feat3, desc: "Expand your wander list" },
  { id: "itinerary", title: "Smart Itinerary Planning", img: feat4, desc: "Optimized, weather-aware plans" },
];

export default function FeatureChoices() {
  return (
    <section className="feature-choices">
      <div className="choices-inner">
        <motion.div className="choices-grid" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
          {ITEMS.map((it) => (
            <motion.button
              className="choice-card"
              key={it.id}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ backgroundImage: `url(${it.img})` }}
            >
              <div className="choice-body">
                <h4>{it.title}</h4>
                <p className="muted small">{it.desc}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
