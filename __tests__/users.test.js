const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

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

const joeBiden = {
  firstName: 'Joe',
  lastName: 'Biden',
  email: 'joe.biden@defense.gov',
  password: 'password'
};

const registerAndLogin = async (userProps = {}) => {
  const agent = request.agent(app);

  const user = await UserService.create({ ...joeBiden, ...userProps });

  const password = userProps.password ?? joeBiden.password;
  const { email } = user;

  await agent.post('/api/v1/users/sessions').send({ email, password });
  return agent;
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
  it('gets a list of users if the current user is joe.biden@defense.gov', async () => {
    const agent = await registerAndLogin();
    const res = await agent.get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String)
    });
  });
  it('gives a 403 error if a non-authorized user tries to see list of users', async () => {
    const agent = await registerAndLogin(testUser);
    const res = await agent.get('/api/v1/users');
    expect(res.status).toBe(403);
  });
  it('gives a 401 error if non-authenticated user tries to get list of users', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });
  afterAll(() => {
    pool.end();
  });
});
