const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@test.com',
  password: 'password'
};

const authorizedUser = {
  firstName: 'authorized',
  lastName: 'user',
  email: 'test@defense.gov',
  password: 'password'
};

describe('authentication and authorization routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('creates a new user with defense.gov email', async () => {
    const res = await request(app).post('/api/v1/users').send(authorizedUser);
    const { firstName, lastName, email } = authorizedUser;

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email
    });
  });
  it('does not allow users to sign up without a defense.gov email', async () => {
    const res = await request(app).post('/api/v1/users').send(testUser);
    expect(res.status).toBe(403);
  });
  it('signs in a user', async () => {
    await request(app).post('/api/v1/users').send(authorizedUser);
    const res = await request(app).post('/api/v1/users/sessions').send(authorizedUser);
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Signed in successfully!');
  });
  it('does not sign in an invalid user', async () => {
    const invalidUser = {
      firstName: 'Not A.',
      lastName: 'User',
      email: 'fakeUser@test.com',
      password: 'not!real!'
    };
    const res = await request(app).post('/api/v1/users/sessions').send(invalidUser);
    expect(res.status).toBe(401);
  });
  it('signs out a user', async () => {
    await request(app).post('/api/v1/users').send(testUser);
    await request(app).post('/api/v1/users/sessions').send(testUser);
    const res = await request(app).delete('/api/v1/users/sessions');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Signed out successfully!'
    });
  });
  afterAll(() => {
    pool.end();
  });
});
