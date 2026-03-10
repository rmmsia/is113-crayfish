const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');
const Post = require('../models/Post');

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

module.exports = router;