const express = require("express");
const router = express.Router();
const postController = require("../controllers/post-controller");

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/tags", postController.displayPopularTags);

module.exports = router;