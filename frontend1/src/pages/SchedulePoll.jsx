import { useState } from "react";
const SLOTS = [
  "Today Evening (6–8 PM)",
  "Tomorrow Morning (9–11 AM)",
  "Tomorrow Afternoon (1–3 PM)",
  "Tomorrow Evening (6–8 PM)",
  "Weekend Morning (9–11 AM)",
  "Weekend Evening (6–9 PM)",
];

export default function SchedulePoll({ sessionId }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [bestSlot, setBestSlot] = useState(null);

  const toggle = (slot) => {
    setSelected((s) =>
      s.includes(slot) ? s.filter(x => x !== slot) : [...s, slot]
    );
  };

  const submit = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/schedule/availability`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user: name,
          slots: selected,
        }),
      }
    );

    const data = await res.json();
    setBestSlot(data.best_slot);
  };

  return (
    <div>
      <h3>When are you available?</h3>

      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {SLOTS.map((slot) => (
        <div key={slot}>
          <input
            type="checkbox"
            checked={selected.includes(slot)}
            onChange={() => toggle(slot)}
          />
          {slot}
        </div>
      ))}

      <button onClick={submit}>Submit Availability</button>

      {bestSlot && <p>✅ Best time: {bestSlot}</p>}
    </div>
  );
}
