import { getMockResponse } from "./mock";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const ACCESS_TOKEN_KEY = "access_token";

export async function request(path, options = {}) {
  if (USE_MOCK) {
    return getMockResponse(path, options);
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || "Request failed");
    error.status = response.status;
    error.code = result.code;
    error.data = result;
    throw error;
  }

  return result;
}
