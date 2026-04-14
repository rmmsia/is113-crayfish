const User = require('../models/User');
const Post = require('../models/Post');

async function getUserTree() {
  const users = await User.find({}).lean();

  // Fetch all posts to calculate karma
  const posts = await Post.find({}).lean();

  // Calculate karma for each user
  const karmaMap = {};
  posts.forEach(post => {
    const karma = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
    karmaMap[post.author] = (karmaMap[post.author] || 0) + karma;
  });

  const userMap = {};
  users.forEach(u => {
    u.children = [];
    u.karma = karmaMap[u.username] || 0;
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