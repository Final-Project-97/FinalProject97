import Car from '../models/car.model.js';

export async function getActiveCars(limit) {
  let query = Car.where('status', 'active');
  if (limit) query = query.limit(limit);
  return query.get();
}

export function formatCarLine(car) {
  return `- ID: ${car._id}, Nama: ${car.name}, Brand: ${car.brand}, Tipe: ${car.type}, Harga: Rp ${(Number(car.basePrice) || 0).toLocaleString('id-ID')}, Kapasitas: ${car.specs?.seats || 5} kursi`;
}

export function formatCarSummaryLine(car) {
  return `- ${car.name} (${car.brand}), Tipe: ${car.type}, Harga: Rp ${(Number(car.basePrice) || 0).toLocaleString('id-ID')}, Mesin ${car.specs?.engine || 'N/A'}, Transmisi ${car.specs?.transmission || 'N/A'}, Kapasitas ${car.specs?.seats || 5} kursi.`;
}

export function parseJsonFromLlm(content) {
  const clean = String(content)
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  return JSON.parse(clean);
}

export function formatCarChatCatalogLine(car) {
  return (
    `- ID: ${car._id}, Slug: ${car.slug}, Name: ${car.name}, Brand: ${car.brand}, ` +
    `Type: ${car.type}, Price: Rp ${(Number(car.basePrice) || 0).toLocaleString('id-ID')}, ` +
    `Seats: ${car.specs?.seats || 5}, Transmission: ${car.specs?.transmission || 'N/A'}`
  );
}