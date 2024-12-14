const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    phoneNumber: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    role: {
        type: mongoose.SchemaTypes.String,
    },
    verificationToken: {
        type: mongoose.SchemaTypes.String,
    },
    verified: {
        type: mongoose.SchemaTypes.Boolean,
    },
    createdAt: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: new Date(),
    },
});

module.exports = mongoose.model('users', UserSchema);
