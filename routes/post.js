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
    console.log(updatedPost);
  } catch (err) {
    console.error(err);
  }
  res.redirect(`/post/${id}`);
});

router.get('/post/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate('comments');

    res.render('posts/post', {
      post
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

module.exports = router;