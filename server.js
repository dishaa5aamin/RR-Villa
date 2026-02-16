const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());
// Serves your frontend files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- MONGODB CONNECTION ---
// Railway provides MONGO_URL automatically if you add a MongoDB service
const mongoURI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/RR_Villa_DB';

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// --- MODELS ---
const Booking = mongoose.model('Booking', new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    event_type: String,
    date: String,
    guests: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
}), 'bookings');

const Contact = mongoose.model('Contact', new mongoose.Schema({
    fullName: String,
    email: String,
    subject: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
}));

// --- EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dishaamin72@gmail.com',     
        pass: 'tinxievrgkavzkzc' 
    }
});

// --- ROUTES ---

// 1. BOOKING ROUTE
app.post('/api/bookings/create', async (req, res) => {
    try {
        const { name, email, event_type, date, phone, guests, message } = req.body;

        const newBooking = new Booking(req.body);
        await newBooking.save();

        const adminMail = {
            from: 'dishaamin72@gmail.com',
            to: 'dishaamin72@gmail.com', 
            subject: `🚨 New Booking Alert: ${event_type}`,
            html: `<h2>New Booking Request</h2>
                   <p><b>Name:</b> ${name}</p>
                   <p><b>Event:</b> ${event_type}</p>
                   <p><b>Date:</b> ${date}</p>`
        };

        await transporter.sendMail(adminMail);
        res.status(201).json({ success: true, message: "Booking created" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. CONTACT ROUTE
app.post('/api/contact', async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- SERVER START ---
// IMPORTANT: Railway requires binding to 0.0.0.0 and using process.env.PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`RR Villa is live at http://0.0.0.0:${PORT}`);
});