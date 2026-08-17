import { nearbyQuerySchema } from './validation.js';
import { fetchGooglePlaces } from './placesService.js';
import { fetchSeedShowrooms } from './seedService.js';
import { sortByDistance } from './distance.utils.js';

export async function getNearbyShowrooms(req, res) {
  try {
    const parsed = nearbyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'lat/lng tidak valid' });
    }

    const { lat, lng } = parsed.data;

    try {
      const places = await fetchGooglePlaces(lat, lng);
      if (places.length > 0) {
        const data = sortByDistance(places, lat, lng);
        return res.status(200).json({ success: true, source: 'google_places', data });
      }
    } catch (err) {
      console.warn('[showrooms/places fallback]', err.message);
    }

    const data = fetchSeedShowrooms(lat, lng);
    return res.status(200).json({ success: true, source: 'seed', data });
  } catch (err) {
    console.error('[showrooms/nearby]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}