const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

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

// remove and replace with DB retrieval once implemented
let posts = [
  {
    id: 1,
    title: "haha so funny",
    imageURL: "https://media.tenor.com/BuSEbkm9aAIAAAAi/hi-otag.gif",
    //redirectURL: "",  -- needed?
    author: "admin",
    upvotes: 4,
    downvotes: 0,
    // tags: ["funny, idk"],  -- if got time to implement tags
    comments: [
      {author: "admin2", body: "haha", datetime: "2026-03-04T09:00:00Z"}, // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
      {author: "admin3", body: "not funny bro", datetime: "2026-03-04T12:00:00Z"} // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
    ],
    datetime: "2026-03-04T05:00:00Z" // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
  },
  {
    id: 2,
    title: "funny",
    imageURL: "https://media1.tenor.com/m/B-uBLzMr9BwAAAAd/low-cortisol.gif",
    //redirectURL: "",  -- needed?
    author: "admin3",
    upvotes: 2,
    downvotes: 3,
    // tags: ["funny, idk"],  -- if got time to implement tags
    comments: [
      {author: "admin2", body: "test", datetime: "2026-03-06T02:00:00Z"} // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
    ],
    datetime: "2026-03-05T07:00:00Z" // datetime using ISO 8601 format, with Z at the end indicating UTC timezone
  }
];

router.get('/home', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        console.log('Posts:', posts); // check what comes from DB
        res.render('home', { posts });
    } catch (err) {
        console.error('Error rendering /home:', err); // <- this will show the real reason for 500
        res.status(500).send(err.message);
    }
});

module.exports = router;