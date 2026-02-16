const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }, // 👈 ADD THIS LINE
    phone: { type: String, required: true },
    event_type: { type: String, required: true },
    date: { type: String, required: true },
    guests: { type: String },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
