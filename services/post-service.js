const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

function createServiceError(message, status = 500, code = null) {
	const error = new Error(message);
	error.status = status;

	if (code) {
		error.code = code;
	}

	return error;
}

exports.getAllPosts = async (sort = 'new') => {
	const posts = await Post.find();

	//Sort by upvotes
	if (sort === 'top') {
		return posts.sort((a, b) => {
			const scoreA = a.upvotes - a.downvotes;
			const scoreB = b.upvotes - b.downvotes;
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

exports.createPost = async ({ title, imageURL, description, author }) => {
	const post = new Post({
		title,
		imageURL,
		description,
		author,
		upvotes: 0,
		downvotes: 0
	});

	return post.save();
};

exports.addCommentToPost = async ({ postId, commentText, author }) => {
	if (!mongoose.isValidObjectId(postId)) {
		throw createServiceError('Post not found.', 404);
	}

	const newComment = new Comment({
		text: commentText,
		author,
		post: postId
	});

	const savedComment = await newComment.save();

	await Post.findByIdAndUpdate(
		postId,
		{ $push: { comments: savedComment._id } },
		{ new: true }
	);

	return savedComment;
};

exports.deleteCommentFromPost = async ({ postId, commentId, username }) => {
	if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
		throw createServiceError("Comment doesn't exist", 404);
	}

	const comment = await Comment.findById(commentId);

	if (!comment) {
		throw createServiceError("Comment doesn't exist", 404);
	}

	if (username !== comment.author) {
		throw createServiceError("Unauthorized to delete other users' comments", 404);
	}

	await Comment.findByIdAndDelete(commentId);
	await Post.findByIdAndUpdate(comment.post, {
		$pull: { comments: commentId }
	});
};

exports.editCommentInPost = async ({ postId, commentId, updatedText, username }) => {
	if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
		throw createServiceError("Comment doesn't exist", 404);
	}

	if (!updatedText) {
		throw createServiceError("Comment doesn't exist", 404);
	}

	const comment = await Comment.findById(commentId);

	if (!comment) {
		throw createServiceError("Comment doesn't exist", 404);
	}

	if (username !== comment.author) {
		throw createServiceError("Unauthorized to edit other users' comments", 404);
	}

	comment.text = updatedText;
	await comment.save();

	return comment;
};

exports.getPostByIdWithComments = async ({ postId }) => {
	if (!mongoose.isValidObjectId(postId)) {
		throw createServiceError('Post not found.', 404);
	}

	const post = await Post.findById(postId).populate('comments');

	if (!post) {
		throw createServiceError('Post not found.', 404);
	}

	return post;
};