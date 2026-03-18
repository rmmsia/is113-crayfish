const profileService = require('../services/profile-service');

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
    console.error('Error retrieving profile: ' + err);
    res.status(err.status || 500).send(err.message);
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
    console.error('Error retrieving profile: ' + err);
    res.status(err.status || 500).send(err.message);
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
    console.error('Error updating profile: ' + err);
    res.status(err.status || 500).send(err.message);
  }
}