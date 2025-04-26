const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("notification", notificationSchema)