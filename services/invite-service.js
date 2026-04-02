const Invite = require('../models/Invite');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createServiceError(message, status = 500, code = null) {
  const error = new Error(message);
  error.status = status;

  if (code) {
    error.code = code;
  }

  return error;
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10);
}

exports.getInvitesByCreator = async (username) => Invite.find({
  createdBy: username
}).sort({ createdAt: -1 });

exports.generateInvitation = async ({ email, inviterUsername, inviterEmail }) => {
  if (!EMAIL_REGEX.test(email)) {
    throw createServiceError('Please enter a valid email address.', 400, 'INVALID_EMAIL');
  }

  const existingInvite = await Invite.findOne({ targetEmail: email });

  if (existingInvite) {
    throw createServiceError('This email already has an invite.', 400, 'DUPLICATE_INVITE');
  }

  if (email === inviterEmail) {
    throw createServiceError('You cannot invite yourself.', 400, 'SELF_INVITE');
  }

  const inviteCode = generateInviteCode();

  const newInvite = new Invite({
    createdBy: inviterUsername,
    targetEmail: email,
    status: 'Pending',
    code: inviteCode
  });

  await newInvite.save();

  const inviteList = await exports.getInvitesByCreator(inviterUsername);

  return {
    invite: {
      inviteID: inviteCode,
      status: 'Pending',
      invitedUser: email
    },
    email,
    inviteList
  };
};

exports.retractInvitation = async ({ code, inviterUsername }) => {
  const invite = await Invite.findOne({
    code,
    createdBy: inviterUsername
  });

  if (!invite) {
    throw createServiceError('Invite not found.', 404, 'INVITE_NOT_FOUND');
  }

  if (invite.status !== 'Pending') {
    throw createServiceError('Only pending invites can be retracted.', 400, 'INVITE_ALREADY_USED');
  }

  await Invite.deleteOne({
    code,
    createdBy: inviterUsername
  });

  return await exports.getInvitesByCreator(inviterUsername);
};

exports.updateInvitation = async ({ code, email, inviterUsername, inviterEmail }) => {
  if (!EMAIL_REGEX.test(email)) {
    throw createServiceError('Please enter a valid email address.', 400, 'INVALID_EMAIL');
  }

  if (email === inviterEmail) {
    throw createServiceError('You cannot invite yourself.', 400, 'SELF_INVITE');
  }

  const invite = await Invite.findOne({
    code,
    createdBy: inviterUsername
  });

  if (!invite) {
    throw createServiceError('Invite not found.', 404, 'INVITE_NOT_FOUND');
  }

  if (invite.status !== 'Pending') {
    throw createServiceError('Only pending invites can be updated.', 400, 'INVITE_ALREADY_USED');
  }

  const existingInvite = await Invite.findOne({
    targetEmail: email,
    code: { $ne: code }
  });

  if (existingInvite) {
    throw createServiceError('This email already has an invite.', 400, 'DUPLICATE_INVITE');
  }

  invite.targetEmail = email;
  await invite.save();

  return await exports.getInvitesByCreator(inviterUsername);
};

