import { nearbyQuerySchema } from './validation.js';
import { fetchGooglePlaces } from './placesService.js';
import { fetchSeedShowrooms } from './seedService.js';
import { sortByDistance } from './distance.utils.js';
import { normalizeBrand } from './brandFilter.utils.js';

export async function getNearbyShowrooms(req, res) {
  try {
    const parsed = nearbyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'lat/lng tidak valid' });
    }

    const { lat, lng, brand } = parsed.data;
    const normalizedBrand = normalizeBrand(brand);

    try {
      const places = await fetchGooglePlaces(lat, lng, normalizedBrand || undefined);
      if (places.length > 0) {
        const data = sortByDistance(places, lat, lng);
        return res.status(200).json({
          success: true,
          source: 'google_places',
          brand: normalizedBrand || null,
          data,
        });
      }
    } catch (err) {
      console.warn('[showrooms/places fallback]', err.message);
    }

    const data = fetchSeedShowrooms(lat, lng, normalizedBrand || undefined);
    return res.status(200).json({
      success: true,
      source: 'seed',
      brand: normalizedBrand || null,
      data,
    });
  } catch (err) {
    console.error('[showrooms/nearby]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}