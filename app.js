const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");

const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const inviteRoutes = require('./routes/invite');
const postRoutes = require('./routes/post');

const server = express();
const port = process.env.PORT || 3000;
const path = require("path");

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
server.use('/', postRoutes);

server.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/home");
  } else {
    return res.redirect("/login");
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});