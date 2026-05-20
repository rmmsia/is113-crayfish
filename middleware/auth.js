const User = require('../models/User');

async function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await User.findById(req.session.userId)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    req.user = user
    next()
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { requireLogin };