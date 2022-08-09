const { Router } = require('express');
const Secret = require('../models/Secret');
const authenticate = require('../middleware/authenticate');

module.exports = Router()
  .get('/', authenticate, async (req, res, next) => {
    try {
      const secrets = await Secret.getAll();
      res.json(secrets);
      next();
    }
    catch (e) {
      next(e);
    }
  });
