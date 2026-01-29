const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function startChat({ start_lat, start_lon }) {
  const res = await fetch(`${API_BASE}/chat/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start_lat, start_lon }),
  });

  if (!res.ok) throw new Error("Failed to start chat");
  return res.json();
}

export async function sendChatMessage({ session_id, message }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, message }),
  });

  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

export async function sendChat({ session_id, message }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, message }),
  });

  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}
