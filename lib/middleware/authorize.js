
module.exports = async (req, res, next) => {
  try {
    if (req.body.email.split('@')[1] !== 'defense.gov')
      throw new Error('You do not have access to view this page');

    next();
  } catch (err) {
    err.status = 403;
    next(err);
  }
};
