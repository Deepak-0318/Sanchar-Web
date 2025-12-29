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
  return (
    <section id="planner-section" className="planner-section">
      <div className="planner-inner">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="planner-card"
        >
          <div className="planner-header">
            <h2>Plan your outing</h2>
            <p className="muted">Enter preferences — we’ll craft an optimized local plan.</p>
          </div>

          <div className="planner-grid">
            <label className="input-with-icon">
              <span className="icon">🎯</span>
              <select className="form-control" value={mood} onChange={(e) => setMood(e.target.value)}>
                <option value="chill">Chill</option>
                <option value="fun">Fun</option>
                <option value="romantic">Romantic</option>
              </select>
            </label>

            <label className="input-with-icon">
              <span className="icon">💸</span>
              <input className="form-control" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </label>

            <label className="input-with-icon">
              <span className="icon">⏱️</span>
              <select className="form-control" value={timeAvailable} onChange={(e) => setTimeAvailable(e.target.value)}>
                <option value="1-2 hours">1-2 hours</option>
                <option value="2-4 hours">2-4 hours</option>
                <option value="4-6 hours">4-6 hours</option>
              </select>
            </label>

            <label className="input-with-icon full">
              <span className="icon">📍</span>
              <input className="form-control" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} placeholder="Start location (e.g., Indiranagar)" />
            </label>

            <div className="actions">
              <button className="cta primary" onClick={generate} disabled={loading}>{loading ? "Generating…" : "Generate Plan"}</button>
              <button className="cta ghost" onClick={() => { setMood("chill"); setBudget(800); setTimeAvailable("2-4 hours"); setStartLocation("Indiranagar"); }}>Reset</button>
            </div>
          </div>

          {error && <div className="error" role="alert">{error}</div>}
        </motion.div>
      </div>
    </section>
  );
}
