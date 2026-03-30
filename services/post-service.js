const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Tag = require('../models/Tag');

function createServiceError(message, status = 500, code = null) {
	const error = new Error(message);
	error.status = status;

	if (code) {
		error.code = code;
	}

	return error;
}

exports.getAllPosts = async (sort = 'new') => {
	const posts = await Post.find().populate('tags');

	//Sort by upvotes
	if (sort === 'top') {
		return posts.sort((a, b) => {
			const scoreA = a.upvotes.length - a.downvotes.length;
			const scoreB = b.upvotes.length - b.downvotes.length;
			return scoreB - scoreA;
		});
	}

	//sort by alphabetical order 
	// A-Z
	if (sort === 'author_asc') {
		return posts.sort((a, b) => a.author.localeCompare(b.author));
	}
	// Z-A
	if (sort === 'author_desc') {
		return posts.sort((a, b) => b.author.localeCompare(a.author));
	}

	// default shows latest
	return posts.sort((a, b) => b.createdAt - a.createdAt);
};

exports.createPost = async ({ title, imageURL, description, author, tags }) => {
	const post = new Post({
		title,
		imageURL,
		description,
		author,
		tags: tags || [],
		upvotes: [],
		downvotes: []
	});

	return post.save();
};

exports.createTags = async({ names }) => {
  const tagIds = []
  
  for (const name of names) {
    //find tag
    let tag = await Tag.findOne({ name });
    if (!tag) tag = await Tag.create({ name });
    tagIds.push(tag._id);
  }

  return tagIds;
}

exports.combineTags = async ({ existingTags, newTags }) => {
  //normalise existing tags
  const existingTagsArray = Array.isArray(existingTags) ? existingTags : [existingTags];

  const normalizedExistingTags = existingTagsArray
    .map((tagId) => String(tagId).trim())
    .filter((tagId) => tagId.length > 0);

  //normalise new tags
  let newTagsArray = []

  if (typeof newTags === 'string') {
    newTagsArray = newTags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  }
  //save new tags
  const newTagsIdArray = await exports.createTags({ names: newTagsArray });
  const normalizedNewTagIds = newTagsIdArray.map((tagId) => String(tagId));

  //prevent tag duplicates
  return [...new Set([...normalizedExistingTags, ...normalizedNewTagIds])];
};

exports.upvotePost = async ({ userId, postId }) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw createServiceError('Post not found.', 404);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const isUpvoted = post.upvotes.includes(userIdObj);
  const isDownvoted = post.downvotes.includes(userIdObj);

  //when post is upvoted, remove the upvote
  if (isUpvoted) {
    return await Post.findByIdAndUpdate(
      postId,
      { $pull: { upvotes: userId } },
      { returnDocument: 'after' }
    );
  }

  //add upvote
  const updateVote = { $push: { upvotes: userId } };
  
  //if post is downvoted, remove the downvote 
  if (isDownvoted) {
    updateVote.$pull = { downvotes: userId };
  }

  return await Post.findByIdAndUpdate(postId, updateVote, { returnDocument: 'after' });
};

exports.downvotePost = async({ userId, postId }) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw createServiceError('Post not found.', 404);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const isUpvoted = post.upvotes.includes(userIdObj);
  const isDownvoted = post.downvotes.includes(userIdObj);

  //if post is already downvoted by user, remove the downvote
  if (isDownvoted) {
    return await Post.findByIdAndUpdate(
      postId,
      { $pull: { downvotes: userId } },
      { returnDocument: 'after' }
    );
  }

  //add the user's downvote
  const updateVote = { $push: { downvotes: userId } };

  //if the post is already upvoted by user, remove upvote
  if (isUpvoted) {
    updateVote.$pull = { upvotes: userId };
  }

  return await Post.findByIdAndUpdate(postId, updateVote, { returnDocument: 'after' });
}

exports.addCommentToPost = async ({ postId, commentText, author }) => {
	if (!mongoose.isValidObjectId(postId)) {
		throw createServiceError('Invalid Post', 404);
	}

	const newComment = new Comment({
		text: commentText,
		author,
		post: postId
	});

	const savedComment = await newComment.save();

	await Post.findByIdAndUpdate(
		postId,
		{ $push: { comments: savedComment._id } }
	);

	return savedComment;
};

exports.deleteCommentFromPost = async ({ postId, commentId, username }) => {
	if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
		throw createServiceError("Invalid Post/Comment", 404);
	}

	const comment = await Comment.findById(commentId);

	if (!comment) {
		throw createServiceError("Comment doesn't exist", 404);
	}

	if (username !== comment.author) {
		throw createServiceError("Unauthorized to delete other users' comments", 403);
	}

	await Comment.findByIdAndDelete(commentId);
	await Post.findByIdAndUpdate(comment.post, {
		$pull: { comments: commentId }
	});
};

exports.editCommentInPost = async ({ postId, commentId, updatedText, username }) => {
	if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
		throw createServiceError("Invalid Post/Comment", 404);
	}

	if (!updatedText) {
		throw createServiceError("Comment text cannot be empty", 404);
	}

	const comment = await Comment.findById(commentId);

	if (!comment) {
		throw createServiceError("Comment doesn't exist", 404);
	}

	if (username !== comment.author) {
		throw createServiceError("Unauthorized to edit other users' comments", 403);
	}

	comment.text = updatedText;
	await comment.save();

	return comment;
};

exports.getPost = async ({ postId }) => {
	if (!mongoose.isValidObjectId(postId)) {
		throw createServiceError('Post not found.', 404);
	}
	const post = await Post.findById(postId).populate('comments').populate('tags');

	if (!post) {
		throw createServiceError('Post not found.', 404);
	}

	return post;
};

exports.updatePost = async ({ postId, title, imageURL, description, username, tags }) => {
    const post = await Post.findById(postId);
    if (!post) throw createServiceError('Post not found', 404);
    
    if (post.author !== username) {
        throw createServiceError('Unauthorized to edit this post', 403);
    }

    post.title = title;
    post.imageURL = imageURL;
    post.description = description;
	  post.tags = tags || [];
    
    return await post.save();
};

exports.deletePost = async ({ postId, username }) => {
    const post = await Post.findById(postId);
    if (!post) throw createServiceError('Post not found', 404);

    if (post.author !== username) {
        throw createServiceError('Unauthorized to delete this post', 403);
    }

    await Comment.deleteMany({ _id: { $in: post.comments } });
    
    return await Post.findByIdAndDelete(postId);
};