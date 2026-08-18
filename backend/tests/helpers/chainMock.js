import { jest } from '@jest/globals';

export function chainMock(finalValue) {
  const chain = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(finalValue),
    get: jest.fn().mockResolvedValue(Array.isArray(finalValue) ? finalValue : []),
    update: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
  };
  return chain;
}