const express = require('express');
const router = express.Router();

//Invitation Page 
router.get('/invitation', (req, res) => {
  res.render("invitation", {
    invite : null
  })
})

//Generate-invitation Process
router.post('/generate-invitation', (req,res) => {
  const inviteCode = Math.random().toString(36).substring(2, 10);
  const inviteLink = `http://localhost:3000/register?invite=${inviteCode}`;

  const invite = {
    inviteID: inviteCode, 
    sent: true,
    status: "pending", 
    invitedUser: "Li Jiannan", 
    inviteLink
  }

  res.render("invitation", {
    invite
  });

})

module.exports = router;