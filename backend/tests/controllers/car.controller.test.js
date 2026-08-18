import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockReq, mockRes, getJson, getStatus } from '../helpers/mockReqRes.js';
import { chainMock } from '../helpers/chainMock.js';

const mockCarWhere = jest.fn();

jest.unstable_mockModule('../../src/models/car.model.js', () => ({
  default: { where: mockCarWhere },
}));

const { getCars, getTopCar, getCarById } = await import('../../src/controllers/car.controller.js');

describe('car controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getCars returns list', async () => {
    mockCarWhere.mockReturnValue({
      ...chainMock([{ _id: '1', name: 'Avanza' }]),
      get: jest.fn().mockResolvedValue([{ _id: '1' }]),
    });
    const res = mockRes();
    await getCars(mockReq({ query: {} }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).count).toBe(1);
  });

  it('getTopCar 404 when empty', async () => {
    mockCarWhere.mockReturnValue(chainMock(null));
    const res = mockRes();
    await getTopCar(mockReq(), res);
    expect(getStatus(res)).toBe(404);
  });

  it('getCarById by slug', async () => {
    mockCarWhere.mockReturnValue(chainMock({ _id: '1', slug: 'avanza' }));
    const res = mockRes();
    await getCarById(mockReq({ params: { id: 'avanza' } }), res);
    expect(getStatus(res)).toBe(200);
  });

  it('getCarById 404', async () => {
    mockCarWhere.mockReturnValue(chainMock(null));
    const res = mockRes();
    await getCarById(mockReq({ params: { id: 'missing' } }), res);
    expect(getStatus(res)).toBe(404);
  });

  it('getCars with brand filter', async () => {
    const chain = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue([]),
    };
    mockCarWhere.mockReturnValue(chain);
    const res = mockRes();
    await getCars(mockReq({ query: { brand: 'Toyota', type: 'MPV' } }), res);
    expect(getStatus(res)).toBe(200);
  });

  it('getTopCar 200', async () => {
    mockCarWhere.mockReturnValue(chainMock({ _id: '1', name: 'Top' }));
    const res = mockRes();
    await getTopCar(mockReq(), res);
    expect(getStatus(res)).toBe(200);
  });

  it('getCarById by ObjectId length 24', async () => {
    mockCarWhere.mockReturnValue(chainMock({ _id: '507f1f77bcf86cd799439011' }));
    const res = mockRes();
    await getCarById(mockReq({ params: { id: '507f1f77bcf86cd799439011' } }), res);
    expect(getStatus(res)).toBe(200);
  });

  it('getCars 500', async () => {
    mockCarWhere.mockImplementation(() => { throw new Error('db'); });
    const res = mockRes();
    await getCars(mockReq({ query: {} }), res);
    expect(getStatus(res)).toBe(500);
  });
});