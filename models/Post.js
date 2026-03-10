const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {type: String, required: true},
    imageURL: {type: String},
    description: {type: String},
    author: {type: String},
    upvotes: {type: Number},
    downvotes: {type: Number}
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);