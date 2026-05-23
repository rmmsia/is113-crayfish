const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const path = require('path');
const User = require('./models/User');

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const cors = require('cors');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const inviteRoutes = require('./routes/invite');
const postRoutes = require('./routes/post');
const userTreeRoutes = require('./routes/usertree');

const { requireLogin } = require('./middleware/auth');

const server = express();
const port = process.env.PORT || 3000;

server.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

server.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax',
    httpOnly: true
  }
}))

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Connection error: ', err));

server.use(async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId); 
      req.user = user;
    } catch (err) {
      console.error("Session User Lookup Error:", err);
    }
  }
  next();
});

server.use('/auth', authRoutes);
server.use('/profile', requireLogin, profileRoutes);
server.use('/invite', requireLogin, inviteRoutes);
server.use('/posts', requireLogin, postRoutes);
server.use('/usertree', userTreeRoutes);

server.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Static files and catch-all — production only, after all API routes
if (process.env.NODE_ENV === 'production') {
  server.use(express.static(path.join(__dirname, 'client/dist')));
  server.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  });
}

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});