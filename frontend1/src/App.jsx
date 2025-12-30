import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";

function Planner() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      <h2>Planner Page</h2>
      <p>Planner flow will start here.</p>
    </div>
  );
}

function Gems() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      <h2>Hidden Gems</h2>
      <p>Explore hidden gems here.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/planner" element={<Planner />} />
      <Route path="/gems" element={<Gems />} />
    </Routes>
  );
}
