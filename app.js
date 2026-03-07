const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth')

const server = express();
const port = process.env.PORT || 3000;
const path = require("path");
const Post = require('./models/Post');

// set environment variables from .env file
require("dotenv").config();

server.set("view engine", "ejs")

server.use("/", express.static(path.join(__dirname, "public")));
server.use(express.json());
server.use(express.urlencoded({ extended: true}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('Connection error: ', err));

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

server.use('/', authRoutes);

server.get('/profile', (req, res) => {
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

// Route to home page sorted by top posts by default
// server.get('/home', (req, res) => {
//   // TBD: some function to sort posts before rendering them?

//   res.render("home", { posts })
// });

server.get('/home', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.render('home', { posts });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

server.get('/', (req, res) => {
  res.redirect(`/home`);
});

server.get('/create-post', (req, res) => {
  res.render("create-post")
}); 

server.post('/create-post', async (req, res) => {
  try {
    const { title, imageURL, description } = req.body;

    const post = new Post({
      title,
      imageURL,
      description,
      author: 'Anonymous',
      upvotes: 0,
      downvotes: 0
    });

    await post.save();
    res.redirect('/home');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});