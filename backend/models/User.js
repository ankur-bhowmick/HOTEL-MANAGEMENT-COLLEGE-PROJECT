const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT) || 10);
    // Using JWT_SECRET as a pepper
    const passwordWithSecret = this.password + (process.env.JWT_SECRET || 'Ankur-Bhowmik');
    this.password = await bcrypt.hash(passwordWithSecret, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    const passwordWithSecret = candidatePassword + (process.env.JWT_SECRET || 'Ankur-Bhowmik');
    return await bcrypt.compare(passwordWithSecret, this.password);
};

module.exports = mongoose.model('User', userSchema);
