const { getUserTree } = require('../services/userTree');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const tree = await getUserTree();
  res.render('usertree', { tree });
});

module.exports = router;