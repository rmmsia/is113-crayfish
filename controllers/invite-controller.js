const inviteService = require('../services/invite-service');

exports.displayInvitePage = async (req, res) => {
  try {
    const inviteList = await inviteService.getInvitesByCreator(req.user.username);

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

  try {
    const { invite, inviteList } = await inviteService.generateInvitation({
      email,
      inviterUsername: req.user.username,
      inviterEmail: req.user.email
    });

    res.render('invitation', {
      invite,
      error: null,
      email,
      inviteList
    });
  } catch (err) {
    if (err.code === 'INVALID_EMAIL' || err.code === 'DUPLICATE_INVITE' || err.code === 'SELF_INVITE') {
      return res.render('invitation', {
        error: err.message,
        email,
        invite: null,
        inviteList: []
      });
    }

    res.status(err.status || 500).send('Error sending invite: ' + err.message);
  }
};
