const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: '12345',
};

const registerAndLogin = async () => {
  const agent = request.agent(app);

  const user = await UserService.create({ ...testUser });

  const password = testUser.password;
  const { email } = user;

  await agent.post('/api/v1/users/sessions').send({ email, password });
  return agent;
};


describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('should get list of secrets if user is signed in', async () => {
    const agent = await registerAndLogin();
    const res = await agent.get('/api/v1/secrets');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      title: expect.any(String),
      description: expect.any(String),
      created_at: expect.any(String)
    });
  });
  it('should give a 401 error if user is not signed in and tries to get secrets', async () => {
    const res = await request(app).get('/api/v1/secrets');
    expect(res.status).toBe(401);
  });
  it('should add a new secret if user is logged in', async () => {
    const agent = await registerAndLogin();
    const newSecret = {
      title: 'Birds Aren\'t Real',
      description: 'All birds are small government-created drones built for surveilling the American people.'
    };
    const res = await agent.post('/api/v1/secrets').send(newSecret);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      created_at: expect.any(String),
      ...newSecret
    });
  });
  it('should give a 401 error if user is not signed in and tries to post secret', async () => {
    const newSecret = {
      title: 'Birds Aren\'t Real',
      description: 'All birds are small government-created drones built for surveilling the American people.'
    };
    const res = await request(app).post('/api/v1/secrets').send(newSecret);
    expect(res.status).toBe(401);
  });
  afterAll(() => {
    pool.end();
  });
});
