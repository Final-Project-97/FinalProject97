import { request } from "./client";

export function getCars(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/api/cars${query ? `?${query}` : ""}`);
}

export function getTopCar() {
  return request("/api/cars/top");
}

export function getCarById(id) {
  return request(`/api/cars/${id}`);
}
