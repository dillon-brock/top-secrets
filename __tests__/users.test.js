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

describe('authentication and authorization routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(testUser);
    const { firstName, lastName, email } = testUser;

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email
    });
  });
  it('signs in a user', async () => {
    const res = await request(app).post('/api/v1/users/session').send(testUser);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.any(String));
  });
  afterAll(() => {
    pool.end();
  });
});
