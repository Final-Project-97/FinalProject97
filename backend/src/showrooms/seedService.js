import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sortByDistance } from './distance.util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, '../../config/showrooms.seed.json');

export function fetchSeedShowrooms(lat, lng) {
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  const seed = JSON.parse(raw);

  return sortByDistance(
    seed.map((s) => ({
      name: s.name,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`,
    })),
    lat,
    lng,
  );
}