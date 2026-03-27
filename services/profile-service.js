const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

function createServiceError(message, status = 500, code = null) {
  const error = new Error(message);
  error.status = status;

  if (code) {
    error.code = code;
  }

  return error;
}

exports.getUserStats = async (username) => {
  const userPosts = await Post.find({ author: username });
  const totalPosts = userPosts.length || 0;
  const totalComments = await Comment.countDocuments({ author: username }) || 0;
  const totalKarma = userPosts.reduce((karma, post) => karma + ((post.upvotes.length - post.downvotes.length) || 0), 0);

  return {
    posts: userPosts,
    totalPosts,
    totalComments,
    totalKarma
  };
};

exports.getUserByUsername = async (username) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw createServiceError('User not found.', 404);
  }

  return user;
};

exports.updateUserAbout = async ({ userId, about }) => {
  const updatedUser = await User.findByIdAndUpdate(userId, { about: about });

  if (!updatedUser) {
    throw createServiceError('User not found.', 404);
  }

  return updatedUser;
};