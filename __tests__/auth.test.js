import { jest } from '@jest/globals';
import { mockDb, resetMockDb, mockArcjet, testUser } from './setup.js';

jest.unstable_mockModule('../src/config/database.js', () => ({
  db: mockDb,
  sql: jest.fn(),
}));

jest.unstable_mockModule('../src/config/arcject.js', () => ({
  default: mockArcjet,
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
  },
}));

const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('POST /api/auth/sign-up', () => {
  beforeEach(() => {
    resetMockDb();
    mockArcjet.protect.mockResolvedValue({ isDenied: () => false });
  });

  it('should return 400 when validation fails', async () => {
    const res = await request(app)
      .post('/api/auth/sign-up')
      .send({ name: '', email: 'bad', password: '12' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should return 201 when user is created', async () => {
    const newUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      created_at: new Date(),
    };

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([]);

    mockDb.insert.mockReturnValue(mockDb);
    mockDb.values.mockReturnValue(mockDb);
    mockDb.returning.mockResolvedValue([newUser]);

    const res = await request(app).post('/api/auth/sign-up').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

describe('POST /api/auth/sign-in', () => {
  beforeEach(() => {
    resetMockDb();
    mockArcjet.protect.mockResolvedValue({ isDenied: () => false });
  });

  it('should return 400 when validation fails', async () => {
    const res = await request(app)
      .post('/api/auth/sign-in')
      .send({ email: 'bad', password: '12' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should return 200 when credentials are valid', async () => {
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([testUser]);

    const res = await request(app).post('/api/auth/sign-in').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should return 401 when user is not found', async () => {
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([]);

    const res = await request(app).post('/api/auth/sign-in').send({
      email: 'nonexistent@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('should return 401 when password is wrong', async () => {
    const bcrypt = (await import('bcrypt')).default;
    bcrypt.compare.mockResolvedValueOnce(false);

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockResolvedValue([testUser]);

    const res = await request(app).post('/api/auth/sign-in').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });
});

describe('POST /api/auth/sign-out', () => {
  beforeEach(() => {
    mockArcjet.protect.mockResolvedValue({ isDenied: () => false });
  });

  it('should return 200 and clear the cookie', async () => {
    const res = await request(app).post('/api/auth/sign-out');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Signed out successfully');
  });
});
