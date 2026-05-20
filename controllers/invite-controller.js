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
  if (status >= 500 && context) console.error(context, err);
  res.status(status).json({ error: err.message });
}

exports.getInvites = async (req, res) => {
  try {
    const inviteList = await inviteService.getInvitesByCreator(req.user.username);
    res.json({ inviteList });
  } catch (err) {
    sendError(res, err, 'Error retrieving invites: ');
  }
};

exports.generateInvitation = async (req, res) => {
  const { email } = req.body;

  try {
    const { invite, inviteList } = await inviteService.generateInvitation({
      email,
      inviterUsername: req.user.username,
      inviterEmail: req.user.email
    });

    res.status(201).json({ invite, inviteList });
  } catch (err) {
    if (handledErrors.includes(err.code)) {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    sendError(res, err, 'Error generating invite: ');
  }
};

exports.retractInvitation = async (req, res) => {
  const { code } = req.params;

  try {
    const inviteList = await inviteService.retractInvitation({
      code,
      inviterUsername: req.user.username
    });

    res.json({ inviteList });
  } catch (err) {
    if (handledErrors.includes(err.code)) {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    sendError(res, err, 'Error retracting invite: ');
  }
};

exports.updateInvitation = async (req, res) => {
  const { code } = req.params;
  const { email } = req.body;

  try {
    const inviteList = await inviteService.updateInvitation({
      code,
      email,
      inviterUsername: req.user.username,
      inviterEmail: req.user.email
    });

    res.json({ inviteList });
  } catch (err) {
    if (handledErrors.includes(err.code)) {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    sendError(res, err, 'Error updating invite: ');
  }
};