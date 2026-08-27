import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockReq, mockRes, getJson, getStatus } from '../helpers/mockReqRes.js';
import { chainMock } from '../helpers/chainMock.js';

const mockWishlistWhere = jest.fn();
const mockWishlistCreate = jest.fn();
const mockWishlistDestroy = jest.fn();
const mockCarWhere = jest.fn();

jest.unstable_mockModule('../../src/models/index.js', () => ({
  Wishlist: {
    where: mockWishlistWhere,
    create: mockWishlistCreate,
    destroy: mockWishlistDestroy,
  },
}));

jest.unstable_mockModule('../../src/models/car.model.js', () => ({
  default: { where: mockCarWhere },
}));

const { listWishlist, createWishlist, updateWishlist, deleteWishlist } =
  await import('../../src/wishlist/controller.js');

const userReq = { user: { _id: 'u1' } };

describe('wishlist controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listWishlist 200', async () => {
    mockWishlistWhere.mockReturnValue({
      ...chainMock([]),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue([]),
    });
    const res = mockRes();
    await listWishlist(mockReq(userReq), res);
    expect(getStatus(res)).toBe(200);
  });

  it('createWishlist 201', async () => {
    mockCarWhere.mockReturnValue(chainMock({ _id: 'c1', name: 'Avanza' }));
    mockWishlistWhere.mockReturnValue(chainMock(null));
    mockWishlistCreate.mockResolvedValue({ _id: 'w1', carId: 'c1' });
    const res = mockRes();
    await createWishlist(mockReq({
      ...userReq,
      body: { carId: 'c1', selectedColor: 'Putih' },
    }), res);
    expect(getStatus(res)).toBe(201);
  });

  it('createWishlist 404 when car missing', async () => {
    mockCarWhere.mockReturnValue(chainMock(null));
    const res = mockRes();
    await createWishlist(mockReq({ ...userReq, body: { carId: 'x' } }), res);
    expect(getStatus(res)).toBe(404);
  });

  it('createWishlist 409 when duplicate', async () => {
    mockCarWhere.mockReturnValue(chainMock({ _id: 'c1' }));
    mockWishlistWhere.mockReturnValue(chainMock({ _id: 'w0' }));
    const res = mockRes();
    await createWishlist(mockReq({ ...userReq, body: { carId: 'c1' } }), res);
    expect(getStatus(res)).toBe(409);
  });

  it('updateWishlist 200', async () => {
    mockWishlistWhere
      .mockReturnValueOnce(chainMock({ _id: 'w1' }))
      .mockReturnValueOnce({ update: jest.fn().mockResolvedValue(true) })
      .mockReturnValueOnce(chainMock({ _id: 'w1', notes: 'new' }));
    const res = mockRes();
    await updateWishlist(mockReq({
      ...userReq,
      params: { id: 'w1' },
      body: { notes: 'new' },
    }), res);
    expect(getStatus(res)).toBe(200);
  });

  it('deleteWishlist 200', async () => {
    mockWishlistWhere.mockReturnValue(chainMock({ _id: 'w1' }));
    mockWishlistDestroy.mockResolvedValue(true);
    const res = mockRes();
    await deleteWishlist(mockReq({ ...userReq, params: { id: 'w1' } }), res);
    expect(getStatus(res)).toBe(200);
  });

  it('listWishlist with car summary', async () => {
    mockWishlistWhere.mockReturnValue({
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue([{ _id: 'w1', carId: 'c1' }]),
    });
    mockCarWhere.mockReturnValue(chainMock({
      _id: 'c1', name: 'Avanza', brand: 'Toyota', slug: 'avanza', thumbnailUrl: '', basePrice: 1,
    }));
    const res = mockRes();
    await listWishlist(mockReq(userReq), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).data[0].car.name).toBe('Avanza');
  });

  it('listWishlist car null when deleted', async () => {
    mockWishlistWhere.mockReturnValue({
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue([{ _id: 'w1', carId: 'gone' }]),
    });
    mockCarWhere.mockReturnValue(chainMock(null));
    const res = mockRes();
    await listWishlist(mockReq(userReq), res);
    expect(getJson(res).data[0].car).toBeNull();
  });

  it('createWishlist 409 duplicate key', async () => {
    mockCarWhere.mockReturnValue(chainMock({ _id: 'c1' }));
    mockWishlistWhere.mockReturnValue(chainMock(null));
    mockWishlistCreate.mockRejectedValue({ code: 11000 });
    const res = mockRes();
    await createWishlist(mockReq({ ...userReq, body: { carId: 'c1' } }), res);
    expect(getStatus(res)).toBe(409);
  });

  it('updateWishlist 404', async () => {
    mockWishlistWhere.mockReturnValue(chainMock(null));
    const res = mockRes();
    await updateWishlist(mockReq({ ...userReq, params: { id: 'x' }, body: { notes: 'a' } }), res);
    expect(getStatus(res)).toBe(404);
  });

  it('deleteWishlist 404', async () => {
    mockWishlistWhere.mockReturnValue(chainMock(null));
    const res = mockRes();
    await deleteWishlist(mockReq({ ...userReq, params: { id: 'x' } }), res);
    expect(getStatus(res)).toBe(404);
  });

  it('updateWishlist 500', async () => {
    mockWishlistWhere.mockImplementation(() => { throw new Error('db'); });
    const res = mockRes();
    await updateWishlist(mockReq({ ...userReq, params: { id: 'w1' }, body: { notes: 'x' } }), res);
    expect(getStatus(res)).toBe(500);
  });

  it('deleteWishlist 500', async () => {
    mockWishlistWhere.mockImplementation(() => { throw new Error('db'); });
    const res = mockRes();
    await deleteWishlist(mockReq({ ...userReq, params: { id: 'w1' } }), res);
    expect(getStatus(res)).toBe(500);
  });
});