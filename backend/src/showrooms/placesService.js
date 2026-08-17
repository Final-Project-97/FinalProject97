import axios from 'axios';

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchNearby';

export async function fetchGooglePlaces(lat, lng) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

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

  return (data.places || []).map((place) => ({
    name: place.displayName?.text || 'Showroom',
    address: place.formattedAddress || '',
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    mapsUrl:
      place.googleMapsUri ||
      `https://www.google.com/maps/search/?api=1&query=${place.location?.latitude},${place.location?.longitude}`,
  }));
}