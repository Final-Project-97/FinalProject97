import { request } from "./client";

export function getSubscriptionStatus() {
  return request("/api/subscription/status");
}

export function createSubscriptionCheckout() {
  return request("/api/subscription/checkout", {
    method: "POST",
    body: JSON.stringify({ paymentType: "premium_monthly" }),
  });
}
