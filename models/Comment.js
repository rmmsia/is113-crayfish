const mongoose = require('mongoose');

// For consideration: Adding upvotes/downvotes to comments as well
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, required: true },
    post: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 
    } 
}, { timestamps: true }); 

module.exports = mongoose.model('Comment', commentSchema);