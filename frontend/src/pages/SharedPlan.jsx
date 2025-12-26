import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SharedPlan() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`https://sanchar-api.onrender.com/plan/${planId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPlan(data);
        }
      });
  }, [planId]);

  if (error) return <p>{error}</p>;
  if (!plan) return <p>Loading shared plan…</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Shared Hangout Plan</h2>

      {plan.optimized_plan.map((p, i) => (
        <div key={i}>
          <h4>{p.place_name}</h4>
          <p>
            📍 {p.distance_km} km • ⏱️ {p.visit_time_hr} hr
          </p>
        </div>
      ))}

      <p>{plan.narration}</p>
    </div>
  );
}
