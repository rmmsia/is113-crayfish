const authService = require("../services/auth-service");

function sendError(res, err, context = null) {
  const status = err.status || 500;

  if (status >= 500 && context) {
    console.error(context, err);
  }

  res.status(status).send(context + err.message);
}

exports.registerGet = (req, res) => {
  res.render("auth/register");
};

exports.registerPost = async (req, res) => {
  const { username, email, password, inviter, vcode } = req.body;

  try {
    await authService.registerUser({ username, email, password, inviter, vcode });
    res.redirect("/login");
  } catch (err) {
    sendError(res, err, 'Error registering user: ')
  }
};

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
