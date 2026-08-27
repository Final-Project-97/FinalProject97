import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockPost = jest.fn();

jest.unstable_mockModule('axios', () => ({
  default: { post: mockPost },
}));

const { fetchGooglePlaces } = await import('../../src/showrooms/placesService.js');

describe('fetchGooglePlaces', () => {
  beforeEach(() => jest.clearAllMocks());

  it('[] without api key', async () => {
    const prev = process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.GOOGLE_PLACES_API_KEY;
    expect(await fetchGooglePlaces(-6.2, 106.8)).toEqual([]);
    process.env.GOOGLE_PLACES_API_KEY = prev;
  });

  it('maps response', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'key';
    mockPost.mockResolvedValue({
      data: {
        places: [{
          displayName: { text: 'Dealer' },
          formattedAddress: 'Addr',
          location: { latitude: -6.2, longitude: 106.8 },
        }],
      },
    });
    const r = await fetchGooglePlaces(-6.2, 106.8);
    expect(r[0].name).toBe('Dealer');
  });

  it('fallback mapsUrl when googleMapsUri missing', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'key';
    mockPost.mockResolvedValue({
      data: {
        places: [{
          location: { latitude: -6.2, longitude: 106.8 },
        }],
      },
    });
    const r = await fetchGooglePlaces(-6.2, 106.8);
    expect(r[0].mapsUrl).toContain('google.com/maps');
  });
});