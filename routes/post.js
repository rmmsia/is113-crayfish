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
  editPost,
  deletePost,
  displayEditPost,
  updatePost
} = require('../controllers/post-controller');


router.get("/", displayPosts);

router.get('/create', displayCreatePost);

router.post('/create', createPost);

router.post('/:id/add-comment', addComment);

router.post('/:postId/:commentId/delete', deleteComment);

router.post('/:postId/:commentId/edit', editComment);

router.get('/:id', displayPost);

router.post('/:id/edit', editPost);

router.get('/:id/edit', displayEditPost);

router.post('/:id/delete', deletePost);

module.exports = router;