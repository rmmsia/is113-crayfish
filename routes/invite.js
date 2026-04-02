const express = require('express');
const router = express.Router();
const { displayInvitePage, generateInvitation, updateInvitation, retractInvitation } = require('../controllers/invite-controller');

//Invite page
router.get('/', displayInvitePage);

//Invite generation route
router.post('/generate', generateInvitation);

// Update invite route
router.post('/update', updateInvitation);

//Retract invite route 
router.post('/retract', retractInvitation);

module.exports = router;