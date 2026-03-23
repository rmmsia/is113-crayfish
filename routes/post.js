const express = require('express');
const router = express.Router();
const {
  displayPosts,
  createPost,
  addComment,
  deleteComment,
  editComment,
  displayPost,
  displayCreatePost,
  upvotePost,
  downvotePost
} = require('../controllers/post-controller');


router.get("/", displayPosts);

router.get('/create', displayCreatePost);

router.post('/create', createPost);

router.post('/:id/add-comment', addComment);

router.post('/:postId/:commentId/delete', deleteComment);

router.post('/:postId/:commentId/edit', editComment);

router.get('/:id', displayPost);

router.post('/:id/upvote', upvotePost);

router.post('/:id/downvote', downvotePost);

module.exports = router;