const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/register', (req , res) => {
  res.render('auth/register')
})

router.post('/register', async (req, res) => {
    const { username, email, password, invite, vcode } = req.body;
    console.log('Form submitted:', { username, email, password, invite, vcode });

    try {
      const newUser = User({ username, password, email });
      await newUser.save();
      res.redirect('/login');
    } catch (err) {
      res.status(400).send('Error registering user: ' + err.message);
    }
});

router.get('/login', (req, res) => {
  res.render('auth/login')
})

module.exports = router;