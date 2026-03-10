const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");

const authRoutes = require('./routes/auth')
const indexRoutes = require('./routes/index')
const inviteRoutes = require('./routes/invite')

const server = express();
const port = process.env.PORT || 3000;
const path = require("path");
const Post = require('./models/Post');

const { requireLogin } = require("./middleware/auth");

// set environment variables from .env file
require("dotenv").config();

server.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

server.set("view engine", "ejs")

server.use("/", express.static(path.join(__dirname, "public")));
server.use(express.json());
server.use(express.urlencoded({ extended: true}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('Connection error: ', err));

server.use('/', authRoutes);
server.use('/', indexRoutes);
server.use('/', inviteRoutes);

server.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/home");
  } else {
    return res.redirect("/login");
  }
});

server.get('/create-post', requireLogin, (req, res) => {
  res.render("create-post")
}); 

server.post('/create-post', requireLogin, async (req, res) => {
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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});