const postService = require('../services/post-service');
const Tag = require('../models/Tag');

function sendError(res, err, context = null) {
  const status = err.status || 500;
  if (status >= 500 && context) console.error(context, err);
  res.status(status).json({ error: err.message });
}

exports.getPosts = async (req, res) => {
  try {
    const sort = req.query.sort || 'new';
    const posts = await postService.getAllPosts(sort);
    res.json({ posts, sort });
  } catch (err) {
    sendError(res, err, 'Error fetching posts:');
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await postService.getPost({ postId: req.params.id });
    res.json({ post });
  } catch (err) {
    sendError(res, err, 'Error fetching post:');
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find({}) || [];
    res.json({ tags });
  } catch (err) {
    sendError(res, err, 'Error fetching tags:');
  }
};

exports.getPopularTags = async (req, res) => {
  try {
    const tags = await postService.getPopularTags();
    res.json({ tags });
  } catch (err) {
    sendError(res, err, 'Error fetching popular tags:');
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, imageURL, description, existingTags, newTags } = req.body;
    const allTags = await postService.combineTags({ existingTags, newTags });
    await postService.createPost({ title, imageURL, description, author: req.user.username, tags: allTags });
    res.status(201).json({ success: true });
  } catch (err) {
    sendError(res, err, 'Error creating post:');
  }
};

exports.editPost = async (req, res) => {
  try {
    const { title, imageURL, description, existingTags, newTags } = req.body;
    const allTags = await postService.combineTags({ existingTags, newTags });
    await postService.updatePost({ postId: req.params.id, title, imageURL, description, username: req.user.username, tags: allTags });
    res.json({ success: true });
  } catch (err) {
    sendError(res, err, 'Error updating post:');
  }
};

exports.deletePost = async (req, res) => {
  try {
    await postService.deletePost({ postId: req.params.id, username: req.user.username });
    res.json({ success: true });
  } catch (err) {
    sendError(res, err, 'Error deleting post:');
  }
};

exports.upvotePost = async (req, res) => {
  try {
    await postService.upvotePost({ userId: req.user._id, postId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    sendError(res, err);
  }
};

exports.downvotePost = async (req, res) => {
  try {
    await postService.downvotePost({ userId: req.user._id, postId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    sendError(res, err);
  }
};

exports.addComment = async (req, res) => {
  try {
    await postService.addCommentToPost({ postId: req.params.id, commentText: req.body.commentText, author: req.user.username });
    res.status(201).json({ success: true });
  } catch (err) {
    sendError(res, err, 'Error adding comment:');
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await postService.deleteCommentFromPost({ postId: req.params.postId, commentId: req.params.commentId, username: req.user.username });
    res.json({ success: true });
  } catch (err) {
    sendError(res, err, 'Error deleting comment:');
  }
};

exports.editComment = async (req, res) => {
  try {
    await postService.editCommentInPost({ postId: req.params.postId, commentId: req.params.commentId, updatedText: req.body.updatedText, username: req.user.username });
    res.json({ success: true });
  } catch (err) {
    sendError(res, err, 'Error editing comment:');
  }
};