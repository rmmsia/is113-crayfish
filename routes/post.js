const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

router.get('/create-post', requireLogin, (req, res) => {
  res.render("posts/create-post");
})

router.post('/create-post', requireLogin, async (req, res) => {
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
    res.redirect('/home');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/post/:id/add-comment', requireLogin, async (req, res) => {
  const comment = req.body.add_comment;
  const author = req.user.username;
  const id = req.params.id;
  console.log(id, author, comment);

  try {
    const newComment = new Comment({
      text: comment,
      author: author,
      post: id
    });
    const savedComment = await newComment.save();
    const updatedPost = await Post.findByIdAndUpdate(
            id, 
            { $push: { comments: savedComment._id } }, 
            { new: true }
        );
  } catch (err) {
    console.error(err);
  }
  res.redirect(`/post/${id}`);
});

router.post('/post/:postId/:commentId/delete', requireLogin, async (req, res) => {
  const { postId, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  const user = req.user.username;
  try {
    if (!commentId) {
      res.status(404).send("Comment doesn't exist");
    } else if (user !== comment.author) {
      res.status(404).send("Unauthorized to delete other users' comments");
    } else {
      await Comment.findByIdAndDelete(commentId);
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId }
      });
      res.redirect(`/post/${postId}`);
    }
  } catch (err) {
    console.error(err);
  }
});

router.post('/post/:postId/:commentId/edit', requireLogin, async (req, res) => {
  const { postId, commentId } = req.params;
  const updatedText = req.body.updated_comment;
  const comment = await Comment.findById(commentId);
  const user = req.user.username;
  try {
    if (!updatedText) {
      res.status(404).send("Comment doesn't exist");
    } else if (user !== comment.author) {
      res.status(404).send("Unauthorized to edit other users' comments");
    } else {
      comment.text = updatedText;
      await comment.save();
      res.redirect(`/post/${postId}`);
    }
  } catch (err) {
    console.error(err);
  }
});

router.get('/post/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user.username;
    const post = await Post.findById(id).populate('comments');

    res.render('posts/post', {
      post, user
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

module.exports = router;