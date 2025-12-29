import { motion } from "framer-motion";

export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="spinner-wrap">
      <motion.div
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <div className="spinner-label">{label}…</div>
    </div>
  );
}
