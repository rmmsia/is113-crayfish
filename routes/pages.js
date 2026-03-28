const express = require("express");
const router = express.Router();

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/tags", (req, res) => {
  res.render("tags");
});

module.exports = router;