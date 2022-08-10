module.exports = async (req, res, next) => {
  try {
    if (req.method === 'POST') {
      if (req.body.email.split('@')[1] !== 'defense.gov')
        throw new Error('You do not have access to view this page');
    }
    if (req.method === 'GET') {
      if (req.user.email !== 'joe.biden@defense.gov')
        throw new Error('You do not have access to view this page');
    }
    next();
  } catch (err) {
    err.status = 403;
    next(err);
  }
};
