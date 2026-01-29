import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchSharedPlan } from "../services/planApi";

export default function SharedPlan() {
  const { code } = useParams();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    fetchSharedPlan(code).then(res => setPlan(res.data));
  }, [code]);

  if (!plan) return <p>Loading plan...</p>;

  return (
    <div>
      <h1>{plan.title}</h1>
      <p>Mood: {plan.mood}</p>
      <p>Budget: ₹{plan.budget}</p>

      <ul>
        {plan.places.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ul>

      <p style={{ opacity: 0.6 }}>
        View-only link · Powered by Sanchar
      </p>
    </div>
  );
}
