const BACKEND_URL = "https://sanchar-t63a.onrender.com";

export async function generatePlan(payload) {
  const response = await fetch(`${BACKEND_URL}/generate-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Generate plan failed:", errorText);
    throw new Error("Unable to generate plan");
  }

  return await response.json();
}
