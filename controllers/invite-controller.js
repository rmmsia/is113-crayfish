const inviteService = require('../services/invite-service');

const handledErrors = [
  'INVALID_EMAIL',
  'DUPLICATE_INVITE',
  'SELF_INVITE',
  'INVITE_NOT_FOUND',
  'INVITE_ALREADY_USED'
];

function sendError(res, err, context = null) {
  const status = err.status || 500;

  if (status >= 500 && context) {
    console.error(context, err);
  }

  res.status(status).send(context + err.message);
}

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
    sendError(res, err, 'Error retrieving invites: ')
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
    if (handledErrors.includes(err.code)) {
      const inviteList = await inviteService.getInvitesByCreator(req.user.username);

      return res.render('invitation', {
        error: err.message,
        email,
        invite: null,
        inviteList
      });
    }

    sendError(res, err, 'Error generating invite: ');
  }
};

exports.retractInvitation = async (req,res) => {
  const code = req.body.code; 

  try {
    const inviteList = await inviteService.retractInvitation({
      code,
      inviterUsername: req.user.username
    })

    res.render('invitation', {
      invite: null,
      email: null,
      error: null,
      inviteList
    });
  } catch (err) {
    if(handledErrors.includes(err.code)){
      const inviteList = await inviteService.getInvitesByCreator(req.user.username);

      return res.render('invitation', {
        invite: null,
        email: null,
        error: err.message,
        inviteList
      });
    }

    sendError(res, err, 'Error retracting invite: ');
  }
};

exports.updateInvitation = async (req, res) => {
  const code = req.body.code;
  const email = req.body.email;

  try {
    const inviteList = await inviteService.updateInvitation({
      code,
      email,
      inviterUsername: req.user.username,
      inviterEmail: req.user.email
    });

    res.render('invitation', {
      invite: null,
      email: null,
      error: null,
      inviteList
    });
  } catch (err) {
      const inviteList = await inviteService.getInvitesByCreator(req.user.username);

      if (handledErrors.includes(err.code)) {
        return res.render('invitation', {
          invite: null,
          email: null,
          error: err.message,
          inviteList
        });
      }

      sendError(res, err, 'Error updating invite: ');
  }
};
