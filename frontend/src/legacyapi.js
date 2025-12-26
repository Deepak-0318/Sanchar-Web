// src/legacyapi.js

const API_BASE_URL = "https://sanchar-web.onrender.com";

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
    console.error("Backend error:", text);
    throw new Error("Failed to generate plan");
  }

  return response.json();
}
