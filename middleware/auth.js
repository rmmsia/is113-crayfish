const User = require('../models/User');

async function setLocals(req, res, next) {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId);
    res.locals.currentUser = user || null;
  } else {
    res.locals.currentUser = null;
  }
  next();
}

async function requireLogin(req, res, next) {
  if (!res.locals.currentUser) return res.redirect('/login');
  req.user = res.locals.currentUser;
  next();
}

module.exports = { setLocals, requireLogin };