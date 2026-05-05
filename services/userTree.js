const User = require('../models/User');
const Post = require('../models/Post');

async function getUserTree() {
  const users = await User.find({}).lean();
  const posts = await Post.find({}).lean();

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

  const roots = []; // Change from a single variable to an array

  users.forEach(u => {
    if (u.invitedBy && userMap[u.invitedBy]) {
      userMap[u.invitedBy].children.push(u);
    } else {
      roots.push(u); // Anyone without a valid parent is a root
    }
  });

  return roots;
}

module.exports = { getUserTree };