const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const testUser = {
  first_name: 'Test',
  last_name: 'User',
  email: 'test@test.com',
  password: 'password'
};

describe('authentication and authorization routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(testUser);
    const { first_name, last_name, email } = testUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      first_name,
      last_name,
      email
    });
  });
  afterAll(() => {
    pool.end();
  });
});
