const postService = require('../services/post-service');
const Tag = require('../models/Tag');

function sendError(res, err, context = null) {
  const status = err.status || 500;

  if (status >= 500 && context) {
    console.error(context, err);
  }

  res.status(status).send(context + err.message);
}

exports.displayPosts = async (req, res) => {
  try {
    const sort = req.query.sort || 'new';
    const posts = await postService.getAllPosts(sort);
    const userId = req.user._id;
    const route = req.originalUrl
    //console.log(route);

    res.render('home', { posts, sort, userId, route });
  } catch (err) {
    sendError(res, err, 'Error rendering /home:');
  }
};

exports.upvotePost = async (req, res) => {
  const { id } = req.params;
  const { route } = req.body;
  const userId = req.user._id;

  try {
    await postService.upvotePost({ userId, postId: id });

    res.redirect(route);
  } catch (err) {
    sendError(res, err)
  }
}

exports.downvotePost = async (req, res) => {
  const { id } = req.params;
  const { route } = req.body;
  const userId = req.user._id;

  try {
    await postService.downvotePost({ userId, postId: id });

    res.redirect(route);
  } catch (err) {
    sendError(res,err)
  }
}

exports.displayCreatePost = async (req, res) => {
  try {
    const tags = await Tag.find({}) || [];
    res.render('posts/create-post', {
      tags
    });
  } catch (err) {
    sendError(res, err, 'Error displaying create page:');
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, imageURL, description, existingTags, newTags } = req.body;

    const allTags = await postService.combineTags({ existingTags, newTags });

    //create post
    await postService.createPost({
      title,
      imageURL,
      description,
      author: req.user.username,
      tags: allTags
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
    const userId = req.user._id;

    const post = await postService.getPost({ postId: id });

    res.render('posts/post', {
      post,
      user,
      userId
    });
  } catch (err) {
    sendError(res, err, 'Error displaying post:');
  }
};

exports.editPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, imageURL, description, existingTags, newTags } = req.body;
        const username = req.user.username;

        const allTags = await postService.combineTags({ existingTags, newTags });

        await postService.updatePost({
            postId: id,
            title,
            imageURL,
            description,
            username,
            tags: allTags
        });

        res.redirect(`/posts/${id}`);
    } catch (err) {
        sendError(res, err, 'Error updating post:');
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const username = req.user.username;

        await postService.deletePost({ postId: id, username });

        res.redirect('/posts');
    } catch (err) {
        sendError(res, err, 'Error deleting post:');
    }
};

exports.displayEditPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postService.getPost({ postId: id });
    const tags = await Tag.find();

    res.render('posts/edit-post', { post, tags }); 
  } catch (err) {
    sendError(res, err, 'Error displaying edit page:');
  }
};

