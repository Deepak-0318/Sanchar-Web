import axios from "axios";

const API_BASE = "http://localhost:8000";

export const createPlan = (planData) =>
  axios.post(`${API_BASE}/plans`, planData);

export const fetchSharedPlan = (shareCode) =>
  axios.get(`${API_BASE}/plans/share/${shareCode}`);
