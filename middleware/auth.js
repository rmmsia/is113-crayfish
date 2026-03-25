const session = require("express-session");
const User = require('../models/User');

async function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');

  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect('/login');

  req.user = user; // attach user
  next();
}

module.exports = { requireLogin };