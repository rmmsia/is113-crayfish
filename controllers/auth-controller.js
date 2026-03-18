const authService = require("../services/auth-service");

exports.displayRegister = (req, res) => {
  res.render("auth/register");
};

exports.submitRegister = async (req, res) => {
  const { username, email, password, inviter, vcode } = req.body;

  try {
    await authService.registerUser({ username, email, password, inviter, vcode });
    res.redirect("/login");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.displayLogin = (req, res) => {
  res.render("auth/login", { error: null });
};

exports.submitLogin = async (req, res) => {
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
      return res.status(500).send("Could not log out. Please try again.");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
