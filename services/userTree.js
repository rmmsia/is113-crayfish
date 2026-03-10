const User = require('../models/User');

async function getUserTree() {
  const users = await User.find({}).lean();

  const userMap = {};
  users.forEach(u => {
    u.children = [];
    userMap[u.username] = u;
  });

  let root = null;

  users.forEach(u => {
    if (u.invitedBy) {
      const parent = userMap[u.invitedBy];
      if (parent) parent.children.push(u);
    } else {
      root = u;
    }
  });

  return root ? [root] : [];
}

module.exports = { getUserTree };