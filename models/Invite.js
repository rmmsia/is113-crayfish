const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    createdBy: {type: String, required: true},
    targetEmail: {type: String, required: true, unique: true},
    status: {type: String},
    code: {type: String},
    usedBy: {type: String}
}, { timestamps: true });

module.exports = mongoose.model('Invite', inviteSchema);