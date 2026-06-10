// utils/axios.js
// ──────────────────────────────────────────────────────────────────────────
// REAL API CLIENT — talks to the OJAIN Express backend (ojain-admin/server).
//
// Base URL comes from NEXT_PUBLIC_API_URL (see .env.local); defaults to the
// local dev server on :5000.
//
// Two response shapes from the backend are normalised here so the rest of the
// app can stay simple:
//   1. Envelope unwrap — list/detail endpoints reply { success, data, ... }.
//      We replace response.data with the inner `data` so stores receive the
//      array/object directly. Auth replies ({ success, token, customer }) have
//      no `data` key and pass through untouched.
//   2. id -> _id — Mongoose docs are serialised with `id` (see schemaOptions),
//      but the whole frontend was written against `_id`. We add `_id` back.
// ──────────────────────────────────────────────────────────────────────────

import axios from "axios";

// Production default points at the live backend. Override per environment via
// NEXT_PUBLIC_API_URL (e.g. http://localhost:5000 for local dev, or the Render
// URL once that service is deployed).
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://ojainbackend.vercel.app";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach the stored JWT (customer or admin) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Recursively ensure every object that has `id` also exposes `_id`.
const withMongoId = (value) => {
  if (Array.isArray(value)) return value.map(withMongoId);
  if (value && typeof value === "object") {
    if (value.id !== undefined && value._id === undefined) value._id = value.id;
    for (const key of Object.keys(value)) {
      if (value[key] && typeof value[key] === "object") {
        value[key] = withMongoId(value[key]);
      }
    }
  }
  return value;
};

api.interceptors.response.use(
  (response) => {
    let body = response.data;
    // Unwrap the { success, data } envelope (but keep auth payloads intact).
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      "data" in body
    ) {
      body = body.data;
    }
    response.data = withMongoId(body);
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
