import { jest } from '@jest/globals';
import {
  mockDb,
  resetMockDb,
  mockArcjet,
  testUser,
  adminUser,
} from './setup.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = user =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '1d',
  });

jest.unstable_mockModule('../src/config/database.js', () => ({
  db: mockDb,
  sql: jest.fn(),
}));

jest.unstable_mockModule('../src/config/arcject.js', () => ({
  default: mockArcjet,
}));

const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('GET /api/users', () => {
  beforeEach(() => {
    resetMockDb();
    mockArcjet.protect.mockResolvedValue({ isDenied: () => false });
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('should return 403 for non-admin users', async () => {
    const token = generateToken(testUser);

    const res = await request(app)
      .get('/api/users')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Admin access required');
  });

  it('should return 200 with user list for admin', async () => {
    const token = generateToken(adminUser);
    const userList = [
      { id: 1, name: 'User 1', email: 'user1@test.com', role: 'user' },
      { id: 2, name: 'User 2', email: 'user2@test.com', role: 'admin' },
    ];

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockResolvedValue(userList);

    const res = await request(app)
      .get('/api/users')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toEqual(userList);
  });
});

describe('GET /api/users/:id', () => {
  beforeEach(() => {
    resetMockDb();
    mockArcjet.protect.mockResolvedValue({ isDenied: () => false });
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app).get('/api/users/1');

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid id', async () => {
    const token = generateToken(testUser);

    const res = await request(app)
      .get('/api/users/abc')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should return 404 when user not found', async () => {
    const token = generateToken(testUser);

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/users/999')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('should return 200 with user data', async () => {
    const token = generateToken(testUser);
    const userData = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    };

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([userData]);

    const res = await request(app)
      .get('/api/users/1')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(userData);
  });
});

describe('PUT /api/users/:id', () => {
  beforeEach(() => {
    resetMockDb();
    mockArcjet.protect.mockResolvedValue({ isDenied: () => false });
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .send({ name: 'Updated' });

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid id', async () => {
    const token = generateToken(testUser);

    const res = await request(app)
      .put('/api/users/abc')
      .set('Cookie', `token=${token}`)
      .send({ name: 'Updated' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when no fields provided', async () => {
    const token = generateToken(testUser);

    const res = await request(app)
      .put('/api/users/1')
      .set('Cookie', `token=${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No fields to update');
  });

  it('should return 404 when user not found', async () => {
    const token = generateToken(testUser);

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([]);

    const res = await request(app)
      .put('/api/users/999')
      .set('Cookie', `token=${token}`)
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('should return 200 when user is updated', async () => {
    const token = generateToken(testUser);
    const updatedUser = {
      id: 1,
      name: 'Updated User',
      email: 'test@example.com',
      role: 'user',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-02T00:00:00.000Z',
    };

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([{ id: 1 }]);

    mockDb.update.mockReturnValue(mockDb);
    mockDb.set.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.returning.mockResolvedValue([updatedUser]);

    const res = await request(app)
      .put('/api/users/1')
      .set('Cookie', `token=${token}`)
      .send({ name: 'Updated User' });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated User');
  });

  it('should return 409 when email is already in use', async () => {
    const token = generateToken(testUser);

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 2 }]);

    const res = await request(app)
      .put('/api/users/1')
      .set('Cookie', `token=${token}`)
      .send({ email: 'taken@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });
});

describe('DELETE /api/users/:id', () => {
  beforeEach(() => {
    resetMockDb();
    mockArcjet.protect.mockResolvedValue({ isDenied: () => false });
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app).delete('/api/users/1');

    expect(res.status).toBe(401);
  });

  it('should return 403 for non-admin users', async () => {
    const token = generateToken(testUser);

    const res = await request(app)
      .delete('/api/users/1')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Admin access required');
  });

  it('should return 404 when user not found', async () => {
    const token = generateToken(adminUser);

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([]);

    const res = await request(app)
      .delete('/api/users/999')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('should return 200 when user is deleted', async () => {
    const token = generateToken(adminUser);

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValueOnce(mockDb).mockResolvedValueOnce([]);
    mockDb.limit.mockResolvedValueOnce([{ id: 1 }]);
    mockDb.delete.mockReturnValue(mockDb);

    const res = await request(app)
      .delete('/api/users/1')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
  });
});
