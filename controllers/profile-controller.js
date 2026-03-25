const profileService = require('../services/profile-service');

function sendError(res, err, context = null) {
  const status = err.status || 500;

  if (status >= 500 && context) {
    console.error(context, err);
  }

  res.status(status).send(context + err.message);
}

exports.displayUserProfile = async (req , res) => {
  const user = req.user;

  try {
    const { posts, totalPosts, totalComments, totalKarma } = await profileService.getUserStats(user.username);

    res.render("profile/profile", {
      posts,
      user,
      totalKarma,
      totalPosts,
      totalComments,
      isUser: true
    });
  } catch (err) {
    sendError(res, err, 'Error retrieving profile: ');
  }
}

exports.visitOtherProfile = async (req, res) => {
  const { username } = req.params;

  if (username === req.user.username) return res.redirect('/profile');
  
  try{
    const user = await profileService.getUserByUsername(username);
    const { posts, totalPosts, totalComments, totalKarma } = await profileService.getUserStats(user.username);

    res.render("profile/profile", {
      posts,
      user,
      totalKarma,
      totalPosts,
      totalComments,
      isUser: false
    });
  } catch (err) {
    sendError(res, err, 'Error retrieving profile: ');
  }
}

exports.displayUpdateProfile = async (req, res) => {
  const user = req.user;
  
  res.render('profile/update-profile', {
    user
  })
}

exports.submitUpdateProfile = async (req, res) => {
  const { about } = req.body;
  const user = req.user;

  try {
    await profileService.updateUserAbout({ userId: user._id, about });

    res.redirect('/profile');
  } catch (err) {
    sendError(res, err, 'Error updating profile: ');
  }
}