
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Use a photographic hero-style image for the first feature so it appears in the UI
import feat1 from "../assets/feature-1.JPG";
import feat2 from "../assets/feature-2.JPG";
import feat3 from "../assets/feature-3.JPG";
import feat4 from "../assets/feature-4.JPG";

const features = [
  { title: "Find Hidden Gems", desc: "Discover local offbeat spots", image: feat1 },
  { title: "Hangout with Friends & Family", desc: "Plan group-friendly outings", image: feat2 },
  { title: "Explore New Places", desc: "Expand your wander list", image: feat3 },
  { title: "Smart Itinerary Planning", desc: "Optimized, weather-aware plans", image: feat4 },
];

export default function FeatureCarousel() {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => setIndex((i) => (i + 1) % features.length), 3800);
    return () => clearInterval(timer.current);
  }, []);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.99 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.35 } },
  };

  return (
    <motion.div className="feature-carousel" initial="hidden" animate="show" variants={containerVariants}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="feature-card"
          variants={cardVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6)), url(${features[index].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h3>{features[index].title}</h3>
          <p>{features[index].desc}</p>
        </motion.div>
      </AnimatePresence>

      <div className="feature-dots">
        {features.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to feature ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
