const express = require('express');
const router = express.Router();
const {
  getPosts, getPost, getTags, getPopularTags,
  createPost, editPost, deletePost,
  upvotePost, downvotePost,
  addComment, deleteComment, editComment
} = require('../controllers/post-controller');

router.get('/', getPosts);
router.get('/tags', getPopularTags);
router.get('/tags/all', getTags);
router.post('/', createPost);

router.get('/:id', getPost);
router.patch('/:id', editPost);
router.delete('/:id', deletePost);
router.post('/:id/upvote', upvotePost);
router.post('/:id/downvote', downvotePost);

router.post('/:id/comments', addComment);
router.delete('/:postId/comments/:commentId', deleteComment);
router.patch('/:postId/comments/:commentId', editComment);

module.exports = router;