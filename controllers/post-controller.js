const postService = require('../services/post-service');

function sendError(res, err, context = null) {
  const status = err.status || 500;

  if (status >= 500 && context) {
    console.error(context, err);
  }

  res.status(status).send(err.message);
}

exports.displayPosts = async (req, res) => {
  try {
    const posts = await postService.getAllPosts();
    res.render('home', { posts });
  } catch (err) {
    sendError(res, err, 'Error rendering /home:');
  }
};

exports.displayCreatePost = (req, res) => {
  res.render('posts/create-post');
};

exports.createPost = async (req, res) => {
  try {
    const { title, imageURL, description } = req.body;

    await postService.createPost({
      title,
      imageURL,
      description,
      author: req.user.username
    });

    res.redirect('/posts');
  } catch (err) {
    sendError(res, err, 'Error creating post:');
  }
};

exports.addComment = async (req, res) => {
  const commentText = req.body.add_comment;
  const author = req.user.username;
  const { id } = req.params;

  try {
    await postService.addCommentToPost({
      postId: id,
      commentText,
      author
    });

    res.redirect(`/posts/${id}`);
  } catch (err) {
    sendError(res, err, 'Error adding comment:');
  }
};

exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const user = req.user.username;

  try {
    await postService.deleteCommentFromPost({
      postId,
      commentId,
      username: user
    });

    res.redirect(`/posts/${postId}`);
  } catch (err) {
    sendError(res, err, 'Error deleting comment:');
  }
};

exports.editComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const updatedText = req.body.updated_comment;
  const user = req.user.username;

  try {
    await postService.editCommentInPost({
      postId,
      commentId,
      updatedText,
      username: user
    });

    res.redirect(`/posts/${postId}`);
  } catch (err) {
    sendError(res, err, 'Error editing comment:');
  }
};

exports.displayPost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user.username;

    const post = await postService.getPostByIdWithComments({ postId: id });

    res.render('posts/post', {
      post,
      user
    });
  } catch (err) {
    sendError(res, err, 'Error displaying post:');
  }
};