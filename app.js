const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const inviteRoutes = require('./routes/invite');
const postRoutes = require('./routes/post');
const pagesRoutes = require('./routes/pages');

const server = express();
const port = process.env.PORT || 3000;
const path = require("path");
const { setLocals, requireLogin } = require('./middleware/auth');

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

// const Tag = require('./models/Tag');
// const seedTags = async () => {
//   const count = await Tag.countDocuments();
//   if (count === 0) {
//     await Tag.insertMany([
//       { name: 'News' }, { name: 'Photography' }, { name: 'Help' }, { name: 'Discussion' },  { name: 'Art' }, { name: 'Memes' }, 
//     ]);
//   }
// };
// seedTags();

server.set("view engine", "ejs")

server.use("/", express.static(path.join(__dirname, "public")));
server.use(express.json());
server.use(express.urlencoded({ extended: true}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('Connection error: ', err));

server.use(setLocals);
server.use('/', authRoutes);
server.use('/profile', requireLogin, profileRoutes);
server.use('/invite', requireLogin, inviteRoutes);
server.use('/posts', requireLogin, postRoutes);
server.use('/', pagesRoutes);

server.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/posts");
  } else {
    return res.redirect("/login");
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});