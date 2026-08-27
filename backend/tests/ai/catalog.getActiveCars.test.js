import { jest, describe, it, expect } from '@jest/globals';

const mockGet = jest.fn();

jest.unstable_mockModule('../../src/models/car.model.js', () => ({
  default: {
    where: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnThis(),
      get: mockGet,
    }),
  },
}));

const { getActiveCars } = await import('../../src/ai/catalog.helper.js');

describe('getActiveCars', () => {
  it('without limit', async () => {
    mockGet.mockResolvedValue([{ _id: '1' }]);
    expect(await getActiveCars()).toHaveLength(1);
  });

  it('with limit', async () => {
    mockGet.mockResolvedValue([{ _id: '1' }]);
    expect(await getActiveCars(5)).toHaveLength(1);
  });
});