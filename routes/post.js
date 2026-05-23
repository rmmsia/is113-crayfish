const express = require('express');
const router = express.Router();
const {
  getPosts, getPost, getTags, getPopularTags,
  createPost, editPost, deletePost,
  upvotePost, downvotePost,
  addComment, deleteComment, editComment
} = require('../controllers/post-controller');
const { requireLogin } = require('../middleware/auth');

router.get('/', getPosts);
router.get('/tags', getPopularTags);
router.get('/tags/all', getTags);
router.post('/', requireLogin, createPost);

router.get('/:id', getPost);
router.patch('/:id', requireLogin, editPost);
router.delete('/:id', requireLogin, deletePost);
router.post('/:id/upvote', requireLogin, upvotePost);
router.post('/:id/downvote', requireLogin, downvotePost);

router.post('/:id/comments', requireLogin, addComment);
router.delete('/:postId/comments/:commentId', requireLogin, deleteComment);
router.patch('/:postId/comments/:commentId', requireLogin, editComment);

module.exports = router;