import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sortByDistance } from './distance.utils.js';
import { filterShowroomsByBrand, inferBrandFromName } from './brandFilter.utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, '../../config/showrooms.seed.json');

export function fetchSeedShowrooms(lat, lng, brand) {
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  const seed = JSON.parse(raw);

  const mapped = seed.map((s) => ({
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    brand: s.brand || inferBrandFromName(s.name),
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`,
  }));

  const filtered = filterShowroomsByBrand(mapped, brand);
  return sortByDistance(filtered, lat, lng);
}