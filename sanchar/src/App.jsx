import { useState } from "react";
import "./styles/global.css";

import Landing from "./pages/Landing";
import Input from "./pages/Input";
import Loading from "./pages/Loading";
import Plan from "./pages/Plan";

function App() {
  const [page, setPage] = useState("landing");
  const [query, setQuery] = useState(null);

  function handleGenerate(formData) {
    setQuery(formData);
    setPage("loading");

    // simulate AI delay
    setTimeout(() => {
      setPage("plan");
    }, 2500);
  }

  if (page === "input") {
    return (
      <Input
        onBack={() => setPage("landing")}
        onGenerate={handleGenerate}
      />
    );
  }

  if (page === "loading") {
    return <Loading />;
  }

  if (page === "plan") {
    return <Plan plan={mockPlan(query)} onBack={() => setPage("input")} />;
  }

  return <Landing onStart={() => setPage("input")} />;
}

// ---- MOCK AI RESPONSE ----
function mockPlan(query) {
  return {
    mood: query.mood,
    budget: query.budget,
    time: query.time,
    places: [
      {
        name: "Bugle Rock Park",
        reason: "Peaceful spot to relax and chat",
        time: "5:30 PM",
        cost: "₹0",
      },
      {
        name: "Cafe Udupi Ruchi",
        reason: "Great food that fits your budget",
        time: "7:00 PM",
        cost: "₹200",
      },
    ],
  };
}

export default App;
