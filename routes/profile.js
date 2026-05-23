const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  getUserProfile,
  updateProfile,
} = require("../controllers/profile-controller");
const { requireLogin } = require('../middleware/auth');

router.get("/me", requireLogin, getMyProfile);
router.get("/:username", getUserProfile);
router.patch("/update", requireLogin, updateProfile);

module.exports = router;