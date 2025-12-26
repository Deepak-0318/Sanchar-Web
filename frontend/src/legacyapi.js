// src/legacyapi.js

export async function generatePlan(payload) {
  const response = await fetch("http://127.0.0.1:8000/generate-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to generate plan");
  }

  return response.json();
}
