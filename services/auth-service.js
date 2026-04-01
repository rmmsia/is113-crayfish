const Invite = require('../models/Invite');
const User = require('../models/User');
const crypto = require('crypto');

function createServiceError(message, status = 500, code = null) {
  const error = new Error(message);
  error.status = status;

  if (code) {
    error.code = code;
  }

  return error;
}

function validatePassword(password) {
  let errors = []
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  if (password.length > 128) {
    errors.push('Password is too long.');
  }

  //regex test for special characters
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasSpecialChars) {
    errors.push('Password must contain at least one special character.');
  }

  if (!hasNumber) {
    errors.push('Password must contain at least one number.');
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed");
    err.errors = errors;
    throw err;
  }
}

exports.registerUser = async ({ username, email, password, inviter, vcode }) => {
  //validate password
  validatePassword(password);

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

  // update invite status and usedBy
  invite.status = "Used";
  invite.usedBy = username;
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

exports.generateResetPasswordToken = async({ email }) => {
  const user = await User.findOne({ email });

  
  if (!user) {
    throw new createServiceError('User not found', 404);
  }

  // generate token
  const token = crypto.randomBytes(32).toString('hex');

  // store hashed token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

  await user.save();

  return token;
}

exports.resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ 
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw createServiceError('Invalid or expired token', 400);
  }

  validatePassword(newPassword);
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return user;
}

