const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  getUserProfile,
  updateProfile,
} = require("../controllers/profile-controller");

router.get("/me", getMyProfile);
router.get("/:username", getUserProfile);
router.patch("/update", updateProfile);

module.exports = router;