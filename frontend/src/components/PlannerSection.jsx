import { motion } from "framer-motion";

export default function PlannerSection({
  mood,
  setMood,
  budget,
  setBudget,
  timeAvailable,
  setTimeAvailable,
  startLocation,
  setStartLocation,
  generate,
  loading,
  error,
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="planner-section" className="planner-section">
      <div className="planner-inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="planner-card"
          whileHover={{ boxShadow: "0 28px 60px rgba(15,23,42,0.98)" }}
        >
          <motion.div
            className="planner-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Plan your outing</h2>
            <p className="muted">Enter preferences — we'll craft an optimized local plan.</p>
          </motion.div>

          <motion.div
            className="planner-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.label className="input-with-icon" variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <span className="icon">🎯</span>
              <select className="form-control" value={mood} onChange={(e) => setMood(e.target.value)}>
                <option value="chill">Chill</option>
                <option value="fun">Fun</option>
                <option value="romantic">Romantic</option>
              </select>
            </motion.label>

            <motion.label className="input-with-icon" variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <span className="icon">💸</span>
              <input className="form-control" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </motion.label>

            <motion.label className="input-with-icon" variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <span className="icon">⏱️</span>
              <select className="form-control" value={timeAvailable} onChange={(e) => setTimeAvailable(e.target.value)}>
                <option value="1-2 hours">1-2 hours</option>
                <option value="2-4 hours">2-4 hours</option>
                <option value="4-6 hours">4-6 hours</option>
              </select>
            </motion.label>

            <motion.label className="input-with-icon" variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <span className="icon">📍</span>
              <input className="form-control" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} placeholder="Start location (e.g., Indiranagar)" />
            </motion.label>

            <motion.div
              className="actions"
              variants={itemVariants}
              style={{ display: "flex", gap: 12 }}
            >
              <motion.button
                className="cta primary"
                onClick={generate}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {loading ? "Generating…" : "Generate Plan"}
              </motion.button>
              <motion.button
                className="cta ghost"
                onClick={() => {
                  setMood("chill");
                  setBudget(800);
                  setTimeAvailable("2-4 hours");
                  setStartLocation("Indiranagar");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Reset
              </motion.button>
            </motion.div>
          </motion.div>

          {error && (
            <motion.div
              className="error"
              role="alert"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
