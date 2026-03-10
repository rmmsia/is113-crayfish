const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth')
const Invite = require('../models/Invite');

//Invitation Page 
router.get('/invitation', requireLogin, (req, res) => {
  res.render("invitation", {
    invite : null,
    email: null,
    error: null
  })
})

//Generate-invitation Process
router.post('/generate-invitation', requireLogin, async (req, res) => {
  const email = req.body.email;
  const inviteCode = Math.random().toString(36).substring(2, 10);

  try {
    // Check if invite already exists
    const existingInvite = await Invite.findOne({ targetEmail: email });

    if (existingInvite) {
      return res.render("invitation", {
        error: "This email already has an invite.",
        email: email,
        invite: null
      });
    }

    const newInvite = new Invite({
      createdBy: req.user.username,
      targetEmail: email,
      status: "Pending",
      code: inviteCode
    });

    await newInvite.save();

    res.render("invitation", {
      invite: {
        inviteID: inviteCode,
        status: "Pending",
        invitedUser: email
      },
      error: null,
      email
    });

  } catch (err) {
    res.status(500).send("Error sending invite: " + err.message);
  }
});

module.exports = router;