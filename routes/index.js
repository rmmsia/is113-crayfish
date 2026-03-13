const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { requireLogin } = require('../middleware/auth');

router.get('/profile', (req , res) => {
  const user = {
    username: "username",
    invite: "admin",
    karma: 67,
    totalPosts: 2,
    totalComments: 120,
    about: "I was dropped as a child",
    joinedAt: "2026-03-05T07:00:00Z"
  }
  
  res.render("profile", {
    user
  })
})

router.get('/home', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.render('home', { posts });
    } catch (err) {
        console.error('Error rendering /home:', err); // <- this will show the real reason for 500
        res.status(500).send(err.message);
    }
});

module.exports = router;