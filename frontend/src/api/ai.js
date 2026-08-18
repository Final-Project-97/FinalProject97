import { request } from "./client";

export function getRecommendations(criteria) {
  return request("/api/ai/recommend", {
    method: "POST",
    body: JSON.stringify(criteria),
  });
}

export function sendChatMessage(message) {
  return request("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function simulateCredit(payload) {
  return request("/api/ai/credit-simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
