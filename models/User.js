const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match: /.+\@.+\..+/
    },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);