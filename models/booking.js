const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    location: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, required: true },
    requirements: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);