const express = require('express');
const router = express.Router();
const { getInvites, generateInvitation, updateInvitation, retractInvitation } = require('../controllers/invite-controller');

router.get('/', getInvites);
router.post('/', generateInvitation);
router.patch('/:code', updateInvitation);
router.delete('/:code', retractInvitation);

module.exports = router;