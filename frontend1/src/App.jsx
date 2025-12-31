import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import GetStarted from "./pages/GetStarted";
import Planner from "./pages/Planner";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/planner" element={<Planner />} />
    </Routes>
  );
}

export default App;
