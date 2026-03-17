const Invite = require('../models/Invite');

exports.displayInvitePage = async (req, res) => {
  try {
    const inviteList = (await Invite.find({
      createdBy: req.user.username
    })).reverse();

    res.render('invitation', {
      invite: null,
      email: null,
      error: null,
      inviteList
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading database');
  }
};

exports.generateInvitation = async (req, res) => {
  const email = req.body.email;
  const inviteCode = Math.random().toString(36).substring(2, 10);

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render('invitation', {
        error: 'Please enter a valid email address.',
        email,
        invite: null,
        inviteList: []
      });
    }

    const existingInvite = await Invite.findOne({ targetEmail: email });
    if (existingInvite) {
      return res.render('invitation', {
        error: 'This email already has an invite.',
        email,
        invite: null,
        inviteList: []
      });
    }

    if (email === req.user.email) {
      return res.render('invitation', {
        error: 'You cannot invite yourself.',
        email,
        invite: null,
        inviteList: []
      });
    }

    const newInvite = new Invite({
      createdBy: req.user.username,
      targetEmail: email,
      status: 'Pending',
      code: inviteCode
    });

    await newInvite.save();

    const inviteList = (await Invite.find({
      createdBy: req.user.username
    })).reverse();

    res.render('invitation', {
      invite: {
        inviteID: inviteCode,
        status: 'Pending',
        invitedUser: email
      },
      error: null,
      email,
      inviteList
    });
  } catch (err) {
    res.status(500).send('Error sending invite: ' + err.message);
  }
};
