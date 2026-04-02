const authService = require("../services/auth-service");

function sendError(res, err, context = null) {
  const status = err.status || 500;

  if (status >= 500 && context) {
    console.error(context, err);
  }

  res.status(status).send(context + err.message);
}

exports.registerGet = (req, res) => {
  res.render("auth/register", { errors: null, formData: null });
};

exports.registerPost = async (req, res) => {
  const { username, email, password, inviter, vcode } = req.body;

  try {
    await authService.registerUser({ username, email, password, inviter, vcode });
    res.redirect("/register-success");
  } catch (err) {
    res.render('auth/register', {
      errors: err.errors || [err.message],
      formData: { username, email, password, inviter, vcode }
    });
  }
};

exports.registerSuccess = async (req, res) => {
  res.render("auth/register-success")
}

exports.loginGet = (req, res) => {
  res.render("auth/login", { error: null });
};

exports.loginPost = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await authService.loginUser({ username, password });

    req.session.userId = user._id;

    res.redirect("/posts");
  } catch (err) {
    res.render("auth/login", { error: err.message });
  }
};

exports.processLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return sendError(res, err, 'Could not log out. Please try again.');
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};

exports.forgotPasswordGet = async (req, res) => {
  res.render("auth/forgot-password", { error: null, resetLink: null, email: null });
}

exports.forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  try {
    const token = await authService.generateResetPasswordToken({ email });

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    res.render("auth/forgot-password", { resetLink, email, error: null });
  } catch (err) {

    res.render("auth/forgot-password", { resetLink: null, error: err.message, email });
  }
}

exports.resetPasswordGet = async (req, res) => {  
  const { token } = req.query;

  res.render('auth/reset-password', { token, password: null, errors: null });
}

exports.resetPasswordPost = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    await authService.resetPassword({
      token,
      newPassword: password
    });

    res.redirect('/reset-success');
  } catch (err) {
    res.render('auth/reset-password', { 
      token, 
      password,
      errors: err.errors || [err.message]
    })
  }
}

exports.resetSuccess = async (req, res) => {
  res.render('auth/reset-success');
}