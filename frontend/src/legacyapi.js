// src/legacyapi.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function generatePlan(payload) {
  const response = await fetch(`${API_BASE_URL}/generate-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to generate plan");
  }

  return response.json();
}
