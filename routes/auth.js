const express = require("express");
const router = express.Router();
const {
  displayRegister,
  processLogout,
  submitRegister,
  displayLogin,
  submitLogin,
} = require("../controllers/auth-controller");

router.get("/register", displayRegister);

router.post("/register", submitRegister);

router.get("/login", displayLogin);

router.post("/login", submitLogin);

router.get("/logout", processLogout);

module.exports = router;
