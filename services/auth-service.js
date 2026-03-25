const Invite = require('../models/Invite');
const User = require('../models/User');

function createServiceError(message, status = 500, code = null) {
  const error = new Error(message);
  error.status = status;

  if (code) {
    error.code = code;
  }

  return error;
}

exports.registerUser = async ({ username, email, password, inviter, vcode }) => {
  // verify invite and vcode
  const invite = await Invite.findOne({
    createdBy: inviter,
    code: vcode,
    targetEmail: email,
    status: "Pending"
  });

  if (!invite) {
    throw createServiceError('Invalid invite code or email.', 400);
  }

  // check if username is taken
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw createServiceError('Username already taken.', 400);
  }

  // create user
  const newUser = new User({
    username,
    password,
    email,
    invitedBy: inviter || null
  });

  await newUser.save();

  // update invite status
  invite.status = "Used";
  await invite.save();

  return newUser;
};

exports.loginUser = async ({ username, password }) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw createServiceError('Invalid username or password', 400);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw createServiceError('Invalid username or password', 400);
  }

  return user;
};