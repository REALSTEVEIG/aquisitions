import { jest } from '@jest/globals';

export const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

export const resetMockDb = () => {
  Object.values(mockDb).forEach(fn => fn.mockReset().mockReturnThis());
};

export const mockArcjetDecision = {
  isDenied: jest.fn().mockReturnValue(false),
};

export const mockArcjet = {
  protect: jest.fn().mockResolvedValue(mockArcjetDecision),
};

export const testUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12',
  role: 'user',
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
};

export const adminUser = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  password: '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12',
  role: 'admin',
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
};
