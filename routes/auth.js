const express = require("express");
const router = express.Router();
const {
  processLogout,
  registerGet,
  registerPost,
  loginPost,
  loginGet,
  forgotPasswordGet,
  forgotPasswordPost,
  resetPasswordGet,
  resetPasswordPost,
  resetSuccess,
  registerSuccess
} = require("../controllers/auth-controller");

router.get("/register", registerGet);

router.post("/register", registerPost);

router.get("/register-success", registerSuccess);

router.get("/login", loginGet);

router.post("/login", loginPost);

router.get("/logout", processLogout);

router.get("/forgot-password", forgotPasswordGet);

router.post("/forgot-password", forgotPasswordPost);

router.get("/reset-password", resetPasswordGet);

router.post("/reset-password/:token", resetPasswordPost);

router.get('/reset-success', resetSuccess);

module.exports = router;
