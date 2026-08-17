import { request } from "./client";

export function googleLogin(idToken) {
  return request("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function logoutUser() {
  return request("/api/auth/logout", { method: "POST" });
}
