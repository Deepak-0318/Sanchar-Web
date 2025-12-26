export async function generatePlan(userInput) {
  const payload = {
    user_input: {
      mood: userInput.mood,
      budget: Number(userInput.budget),
      time_available: userInput.time_available,
      start_location: userInput.start_location,
      preferred_time: "evening",
      group_size: 2,
      hidden_gems: true,
      weather_adapt: true
    },
    start_lat: 12.9719,
    start_lon: 77.6412
  };

  const response = await fetch("http://127.0.0.1:8000/generate-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response.json();
}
