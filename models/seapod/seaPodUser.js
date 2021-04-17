const mongoose = require('mongoose');
const lighting = require('./lighting');

module.exports = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        match: /^[0-9a-fA-F]{24}$/,
    },
    userName: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    profilePicUrl: {
        type: String,
    },
    notificationToken: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    lighting: {
        type: lighting,
        default: lighting
    },
    permissionSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permissions'
    },
    checkInDate: {
        type: Number,
        default: Date.now,
        required: true
    },
    accessPeriod: {
        type: Number,
        default: 0
    }
});