import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import FeatureCarousel from "../components/FeatureCarousel";
import FeatureChoices from "../components/FeatureChoices";

export default function Landing() {
  return (
    <main className="landing">
      <Hero onPrimaryClick={() => {}} />

      <section className="features-spot">
        <h2>What Sanchar AI does</h2>
        <p className="muted">Smart, fast, and local — plan adventures in moments.</p>
        <FeatureCarousel />
      </section>

      <FeatureChoices />
    </main>
  );
}
