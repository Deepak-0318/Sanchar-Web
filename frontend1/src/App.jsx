import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import GetStarted from "./pages/GetStarted";
import Planner from "./pages/Planner";
import SharedPlan from "./pages/SharedPlan";
import Gems from "./pages/Gems";

function App() {
  return (
    <Routes>
      <Route path="/plan/:code" element={<SharedPlan />} />
      <Route path="/" element={<Landing />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/planner" element={<Planner />} />
      <Route path="/gems" element={<Gems />} /> {/* ✅ ADD THIS */}
    </Routes>
  );
}

export default App;
