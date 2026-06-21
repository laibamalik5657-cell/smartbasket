import axios from "axios";

/* Shared axios instance. API routes live under /api. */
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
