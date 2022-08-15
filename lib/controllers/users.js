const { Router } = require('express');
const UserService = require('../services/UserService');
const authorize = require('../middleware/authorize');
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .get('/', [authenticate, authorize], async (req, res, next) => {
    try {
      const users = await User.getAll();
      res.json(users);
    }
    catch (e) {
      next(e);
    }
  })
  .post('/', authorize, async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);
      res.json(user);
    }
    catch (e) {
      next(e);
    }
  })
  .post('/sessions', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await UserService.signIn(({ email, password }));
      res
        .cookie(process.env.COOKIE_NAME, token, {
          httpOnly: true,
          maxAge: ONE_DAY_IN_MS,
        })
        .json({ message: 'Signed in successfully!' });
    }
    catch (e) {
      next(e);
    }
  })
  .delete('/sessions', async (req, res, next) => {
    try {
      res
        .clearCookie(process.env.COOKIE_NAME)
        .json({ success: true, message: 'Signed out successfully!' });
    }
    catch (e) {
      next(e);
    }
  });
