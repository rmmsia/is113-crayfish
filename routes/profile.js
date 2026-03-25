const express = require("express");
const router = express.Router();
const {
  displayUserProfile,
  visitOtherProfile,
  displayUpdateProfile,
  submitUpdateProfile,
} = require("../controllers/profile-controller");

//WHEN VISITING YOUR PROFILE
router.get("/", displayUserProfile);

//WHEN VISITING OTHER PROFILES
router.get("/u/:username", visitOtherProfile);

//UPDATE PROFILE
router.get("/update", displayUpdateProfile);

router.post("/update", submitUpdateProfile);

module.exports = router;
