const { getUserTree } = require('../services/userTree');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tree = await getUserTree();
    res.json({ tree }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build user tree" });
  }
});

module.exports = router;