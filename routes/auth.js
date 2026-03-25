const express = require("express");
const router = express.Router();
const {
  processLogout,
  registerGet,
  registerPost,
  loginPost,
  loginGet,
} = require("../controllers/auth-controller");

router.get("/register", registerGet);

router.post("/register", registerPost);

router.get("/login", loginGet);

router.post("/login", loginPost);

router.get("/logout", processLogout);

module.exports = router;
