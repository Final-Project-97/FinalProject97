import axios from 'axios';
import { filterShowroomsByBrand } from './brandFilter.utils.js';

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

function mapPlace(place) {
  return {
    name: place.displayName?.text || 'Showroom',
    address: place.formattedAddress || '',
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    mapsUrl:
      place.googleMapsUri ||
      `https://www.google.com/maps/search/?api=1&query=${place.location?.latitude},${place.location?.longitude}`,
  };
}

async function searchNearbyDealers(apiKey, lat, lng) {
  const { data } = await axios.post(
    PLACES_URL,
    {
      includedTypes: ['car_dealer'],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 10000,
        },
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.displayName,places.formattedAddress,places.location,places.googleMapsUri',
      },
      timeout: 8000,
    },
  );

  return (data.places || []).map(mapPlace);
}

async function searchTextDealers(apiKey, lat, lng, brand) {
  const { data } = await axios.post(
    TEXT_SEARCH_URL,
    {
      textQuery: `${brand} car dealer`,
      maxResultCount: 10,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 10000,
        },
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.displayName,places.formattedAddress,places.location,places.googleMapsUri',
      },
      timeout: 8000,
    },
  );

  return (data.places || []).map(mapPlace);
}

export async function fetchGooglePlaces(lat, lng, brand) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  // Tanpa brand → behavior lama
  if (!brand) {
    return searchNearbyDealers(apiKey, lat, lng);
  }

  // Dengan brand → nearby + filter keyword
  const nearby = await searchNearbyDealers(apiKey, lat, lng);
  let filtered = filterShowroomsByBrand(nearby, brand);

  // Fallback text search kalau filter nearby kosong
  if (filtered.length === 0) {
    const textResults = await searchTextDealers(apiKey, lat, lng, brand);
    filtered = filterShowroomsByBrand(textResults, brand);
  }

  return filtered;
}