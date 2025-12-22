import { useState } from "react";

function Input({ onBack, onGenerate }) {
  const [form, setForm] = useState({
    location: "",
    mood: "chill",
    budget: "₹",
    time: "morning",
    group_size: "solo",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleGenerate() {
  onGenerate(form);
}


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Plan your hangout</h2>

      <div style={styles.form}>
        <label>
          Location
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Near me / Area name"
          />
        </label>

        <label>
          Mood
          <select name="mood" value={form.mood} onChange={handleChange}>
            <option value="chill">Chill</option>
            <option value="food">Food</option>
            <option value="nature">Nature</option>
            <option value="adventure">Adventure</option>
          </select>
        </label>

        <label>
          Budget
          <select name="budget" value={form.budget} onChange={handleChange}>
            <option value="₹">₹</option>
            <option value="₹₹">₹₹</option>
            <option value="₹₹₹">₹₹₹</option>
          </select>
        </label>

        <label>
          Time
          <select name="time" value={form.time} onChange={handleChange}>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
        </label>

        <label>
          Group Size
          <select
            name="group_size"
            value={form.group_size}
            onChange={handleChange}
          >
            <option value="solo">Solo</option>
            <option value="2-3">2–3 people</option>
            <option value="4-6">4–6 people</option>
          </select>
        </label>

        <button style={styles.primary} onClick={handleGenerate}>
          Generate Plan
        </button>

        <button style={styles.secondary} onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "24px",
    maxWidth: "420px",
    margin: "0 auto",
  },
  title: {
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  primary: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#0F766E",
    color: "#fff",
    borderRadius: "8px",
  },
  secondary: {
    padding: "10px",
    backgroundColor: "#E5E7EB",
    borderRadius: "8px",
  },
};

export default Input;
