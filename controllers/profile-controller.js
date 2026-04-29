const profileService = require('../services/profile-service');

function sendError(res, err, context = null) {
  const status = err.status || 500;

  if (status >= 500 && context) {
    console.error(context, err);
  }

  res.status(status).json({ error: err.message });
}

exports.getMyProfile = async (req, res) => {
  const user = req.user;

  try {
    const { posts, totalPosts, totalComments, totalKarma } = await profileService.getUserStats(user.username);

    res.json({ posts, user, totalKarma, totalPosts, totalComments });
  } catch (err) {
    sendError(res, err, 'Error retrieving profile: ');
  }
}

exports.getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await profileService.getUserByUsername(username);
    const { posts, totalPosts, totalComments, totalKarma } = await profileService.getUserStats(user.username);

    res.json({ posts, user, totalKarma, totalPosts, totalComments });
  } catch (err) {
    sendError(res, err, 'Error retrieving profile: ');
  }
}

exports.updateProfile = async (req, res) => {
  const { about } = req.body;
  const user = req.user;

  try {
    await profileService.updateUserAbout({ userId: user._id, about });

    res.json({ success: true });
  } catch (err) {
    sendError(res, err, 'Error updating profile: ');
  }
}