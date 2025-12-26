// src/legacyapi.js

const API_BASE = "https://sanchar-api.onrender.com";

export async function generatePlan(payload) {
  const response = await fetch(`${API_BASE}/generate-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to generate plan: ${text}`);
  }

  return response.json();
}
