const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function generatePlan(payload) {
  const res = await fetch(`${API_BASE}/generate-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to generate plan");
  return res.json();
}
