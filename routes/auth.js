const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Invite = require('../models/Invite');

router.get('/register', (req , res) => {
  res.render('auth/register')
})

// potentially refactor as the route is getting long
router.post('/register', async (req, res) => {
    const { username, email, password, inviter, vcode } = req.body;

    // verify invite and vcode
    const invite = await Invite.findOne({
      createdBy: inviter,
      code: vcode,
      targetEmail: email,
      status: "Pending"
    });

    if (!invite) {
      return res.status(400).send('Invalid invite code or email.');
    }

    // check if username is taken
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).send('Username already taken.');
    }

    try {
      const newUser = User({
        username,
        password,
        email,
        invitedBy: inviter || null
      });
      await newUser.save();

      // update invite status
      invite.status = "Used";
      await invite.save();
      res.redirect('/login');
    } catch (err) {
      res.status(400).send('Error registering user: ' + err.message);
    }
});

router.get('/login', (req, res) => {
  res.render('auth/login', { error: null })
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('auth/login', { error: 'Invalid username or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('auth/login', { error: 'Invalid username or password' });
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