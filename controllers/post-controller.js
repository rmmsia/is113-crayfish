const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.displayPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('home', { posts });
  } catch (err) {
    console.error('Error rendering /home:', err);
    res.status(500).send(err.message);
  }
};

exports.displayCreatePost = (req, res) => {
  res.render('posts/create-post');
};

exports.createPost = async (req, res) => {
  try {
    const { title, imageURL, description } = req.body;

    const post = new Post({
      title,
      imageURL,
      description,
      author: req.user.username,
      upvotes: 0,
      downvotes: 0
    });

    await post.save();
    res.redirect('/posts');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.addComment = async (req, res) => {
  const commentText = req.body.add_comment;
  const author = req.user.username;
  const { id } = req.params;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).send('Post not found.');
    }

    const newComment = new Comment({
      text: commentText,
      author,
      post: id
    });

    const savedComment = await newComment.save();
    await Post.findByIdAndUpdate(
      id,
      { $push: { comments: savedComment._id } },
      { new: true }
    );

    res.redirect(`/posts/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const user = req.user.username;

  try {
    if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
      return res.status(404).send("Comment doesn't exist");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send("Comment doesn't exist");
    }

    if (user !== comment.author) {
      return res.status(404).send("Unauthorized to delete other users' comments");
    }

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId }
    });

    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.editComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const updatedText = req.body.updated_comment;
  const user = req.user.username;

  try {
    if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
      return res.status(404).send("Comment doesn't exist");
    }

    const comment = await Comment.findById(commentId);

    if (!updatedText) {
      return res.status(404).send("Comment doesn't exist");
    }

    if (!comment) {
      return res.status(404).send("Comment doesn't exist");
    }

    if (user !== comment.author) {
      return res.status(404).send("Unauthorized to edit other users' comments");
    }

    comment.text = updatedText;
    await comment.save();
    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.displayPost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user.username;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).send('Post not found.');
    }

    const post = await Post.findById(id).populate('comments');

    if (!post) {
      return res.status(404).send('Post not found.');
    }

    res.render('posts/post', {
      post,
      user
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};