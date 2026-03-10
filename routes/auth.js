const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/register', (req , res) => {
  res.render('auth/register')
})

router.post('/register', async (req, res) => {
    const { username, email, password, invite, vcode } = req.body;

    try {
      const newUser = User({
        username,
        password,
        email,
        invitedBy: invite || null
      });
      await newUser.save();
      res.redirect('/login');
    } catch (err) {
      res.status(400).send('Error registering user: ' + err.message);
    }
});

router.get('/login', (req, res) => {
  res.render('auth/login')
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        req.session.userId = user._id;
        res.redirect('/home');
    } catch (err) {
        res.status(500).send('Server error: ' + err.message);
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out. Please try again.');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

module.exports = router;