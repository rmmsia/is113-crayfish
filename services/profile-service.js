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
  const posts = await Post.find({ author: username });
  const totalPosts = posts.length || 0;
  const totalComments = await Comment.countDocuments({ author: username }) || 0;
  const totalKarma = posts.reduce((karma, post) => karma + ((post.upvotes - post.downvotes) || 0), 0);

  return {
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