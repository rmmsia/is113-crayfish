const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

async function retrieveUserData(username) {
  const posts = await Post.find({ author: username });
  const totalPosts = posts.length || 0;
  const totalComments = await Comment.find({ author: username }).countDocuments() || 0;
  const totalKarma = posts.reduce((karma, post) => karma + ((post.upvotes - post.downvotes) || 0), 0);

  return {
    totalPosts,
    totalComments,
    totalKarma
  }
}

exports.displayUserProfile = async (req , res) => {
  const user = req.user;
  const { totalPosts, totalComments, totalKarma } = await retrieveUserData(user.username);
  
  res.render("profile/profile", {
    user,
    totalKarma,
    totalPosts,
    totalComments,
    isUser: true
  })
}

exports.visitOtherProfile = async (req, res) => {
  const { username } = req.params;

  if (username === req.user.username) return res.redirect('/profile');
  
  try{
    const user = await User.findOne({ username });

    if (!user) return res.status(404).send('User not found.');
    
    const { totalPosts, totalComments, totalKarma } = await retrieveUserData(user.username);

    res.render("profile/profile", {
      user,
      totalKarma,
      totalPosts,
      totalComments,
      isUser: false
    })
  } catch (err) {
    console.error('Error retrieving profile: ' + err);
    res.status(500).send(err.message);
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
    const newUser = await User.findByIdAndUpdate(user._id, { about: about });

    if (!newUser) return res.status(404).send('User not found.');

    res.redirect('/profile');
  } catch (err) {
    console.error('Error updating profile: ' + err);
    res.status(500).send(err.message)
  }
}