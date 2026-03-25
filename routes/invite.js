const express = require('express');
const router = express.Router();
const { displayInvitePage, generateInvitation } = require('../controllers/invite-controller');

//Invite page
router.get('/', displayInvitePage);

//Invite generation route
router.post('/generate', generateInvitation);

module.exports = router;