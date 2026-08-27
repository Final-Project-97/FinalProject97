import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockReq, mockRes, getJson, getStatus } from '../helpers/mockReqRes.js';

const mockFetchGooglePlaces = jest.fn();
const mockFetchSeedShowrooms = jest.fn();

jest.unstable_mockModule('../../src/showrooms/placesService.js', () => ({
  fetchGooglePlaces: mockFetchGooglePlaces,
}));

jest.unstable_mockModule('../../src/showrooms/seedService.js', () => ({
  fetchSeedShowrooms: mockFetchSeedShowrooms,
}));

const { getNearbyShowrooms } = await import('../../src/showrooms/controller.js');

describe('getNearbyShowrooms', () => {
  beforeEach(() => jest.clearAllMocks());

  it('400 on invalid query', async () => {
    const res = mockRes();
    await getNearbyShowrooms(mockReq({ query: { lat: 'bad', lng: '0' } }), res);
    expect(getStatus(res)).toBe(400);
  });

  it('200 from google_places when available', async () => {
    mockFetchGooglePlaces.mockResolvedValue([
      { name: 'S1', lat: -6.21, lng: 106.81 },
    ]);
    const res = mockRes();
    await getNearbyShowrooms(mockReq({ query: { lat: '-6.2', lng: '106.8' } }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).source).toBe('google_places');
    expect(getJson(res).brand).toBeNull();
  });

  it('200 from google_places with brand filter', async () => {
    mockFetchGooglePlaces.mockResolvedValue([
      { name: 'Toyota Astra', lat: -6.21, lng: 106.81 },
    ]);
    const res = mockRes();
    await getNearbyShowrooms(mockReq({
      query: { lat: '-6.2', lng: '106.8', brand: 'Toyota' },
    }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).brand).toBe('Toyota');
  });

  it('200 from seed when google places returns empty', async () => {
    mockFetchGooglePlaces.mockResolvedValue([]);
    mockFetchSeedShowrooms.mockReturnValue([{ name: 'Seed', distanceKm: 1 }]);
    const res = mockRes();
    await getNearbyShowrooms(mockReq({ query: { lat: '-6.2', lng: '106.8' } }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).source).toBe('seed');
  });

  it('200 from seed on places failure', async () => {
    mockFetchGooglePlaces.mockRejectedValue(new Error('api down'));
    mockFetchSeedShowrooms.mockReturnValue([{ name: 'Seed', distanceKm: 1 }]);
    const res = mockRes();
    await getNearbyShowrooms(mockReq({ query: { lat: '-6.2', lng: '106.8' } }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).source).toBe('seed');
  });
});