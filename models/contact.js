
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use valid email address"]
    },

    message: {
        type: String,
        required: [true, "Message cannot be empty"],
        trim: true
    },

    status: {
        type: String,
        enum: ["New", "Read", "Replied"],
        default: "New"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Contact", contactSchema);
