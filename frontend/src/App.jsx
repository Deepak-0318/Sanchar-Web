import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Planner from "./pages/Planner";
import "./styles/landing.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/planner" element={<Planner />} />
    </Routes>
  );
}

export default App;

const styles = {
  container: {
    padding: 20,
    color: "#fff",
    background: "#121212",
    minHeight: "100vh",
  },
  form: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  card: {
    border: "1px solid #333",
    padding: 10,
    marginTop: 8,
    borderRadius: 6,
    background: "#1c1c1c",
  },
  poll: {
    marginTop: 20,
    padding: 10,
    border: "1px solid #333",
    borderRadius: 6,
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
  },
};
