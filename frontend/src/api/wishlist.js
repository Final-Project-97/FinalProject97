import { request } from "./client";

export function getWishlist() {
  return request("/api/wishlist");
}

export function addWishlist(payload) {
  return request("/api/wishlist", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateWishlist(id, payload) {
  return request(`/api/wishlist/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteWishlist(id) {
  return request(`/api/wishlist/${id}`, { method: "DELETE" });
}
