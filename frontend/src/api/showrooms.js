import { request } from "./client";

export function getNearbyShowrooms(lat, lng) {
  const query = new URLSearchParams({ lat, lng }).toString();
  return request(`/api/showrooms/nearby?${query}`);
}
