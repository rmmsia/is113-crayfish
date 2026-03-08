const express = require('express');
const router = express.Router();

router.get('/register', (req , res) => {
  res.render('auth/register')
})

router.post('/register', (req, res) => {
    const { username, email, password, invite, vcode } = req.body;
    console.log('Form submitted:', { username, email, password, invite, vcode });

    res.send('Registration successful!');
});

router.get('/login', (req, res) => {
  res.send('login')
})

module.exports = router;