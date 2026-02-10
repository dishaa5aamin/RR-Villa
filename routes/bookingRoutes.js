const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// This handles: POST http://localhost:5000/api/bookings
router.post('/', async (req, res) => {
    console.log("Order Received:", req.body); // Check your terminal to see this!

    try {
        const newBooking = new Booking(req.body);
        const savedData = await newBooking.save();
        
        console.log("✅ Data saved to Compass!");
        res.status(201).json(savedData);
    } catch (err) {
        console.error("❌ Failed to save:", err.message);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;