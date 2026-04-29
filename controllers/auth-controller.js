const authService = require("../services/auth-service");

function sendError(res, err, context = null) {
  const status = err.status || 500;
  if (status >= 500 && context) console.error(context, err);
  res.status(status).json({ error: err.message });
}

exports.register = async (req, res) => {
  const { username, email, password, inviter, vcode } = req.body;

  try {
    await authService.registerUser({ username, email, password, inviter, vcode });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ errors: err.errors || [err.message] });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await authService.loginUser({ username, password });
    req.session.userId = user._id;
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return sendError(res, err, 'Could not log out.');
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
};

exports.me = (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const token = await authService.generateResetPasswordToken({ email });
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    res.json({ resetLink, email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    await authService.resetPassword({ token, newPassword: password });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ errors: err.errors || [err.message] });
  }
};