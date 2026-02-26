const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend'); 
require('dotenv').config();

const app = express();

// --- INITIALIZE RESEND ---
// Correct: We use the NAME of the variable, not the key itself
const resend = new Resend(process.env.RESEND_API_KEY);

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- MONGODB CONNECTION ---
// Correct: We use the NAME of the variable defined in Railway
const mongoURI = process.env.MONGO_URL;

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error Details:');
        console.error(err.message);
    });

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

// --- ROUTES ---

// 1. BOOKING ROUTE
app.post('/api/bookings/create', async (req, res) => {
    try {
        const { name, email, event_type, date, phone, guests, message } = req.body;

        const newBooking = new Booking(req.body);
        await newBooking.save();

        // EMAIL 1: To YOU (The Admin)
        await resend.emails.send({
            from: 'RR Villa Admin <onboarding@resend.dev>',
            to: 'dishaamin72@gmail.com', // Your email
            subject: `🚨 New Booking: ${event_type}`,
            html: `<p>New booking from ${name} for ${date}.</p>`
        });

        // EMAIL 2: To THE USER (The Customer)
        // NOTE: This may fail on Resend Free Tier until you add a domain
        await resend.emails.send({
            from: 'RR Villa <onboarding@resend.dev>',
            to: email, // The email the user typed in the form
            subject: `Booking Confirmed - RR Villa`,
            html: `<h3>Hello ${name},</h3><p>We received your request for ${event_type}.</p>`
        });

        res.status(201).json({ success: true, message: "Booking saved!" });
    } catch (error) {
        console.error("Email Error:", error);
        // We still return success:true because the data WAS saved to MongoDB
        res.status(201).json({ success: true, message: "Booking saved (Email restricted)" });
    }
});

// 2. CONTACT ROUTE
app.post('/api/contact/create', async (req, res) => {
    try {
        const { fullName, email, phone,subject, message } = req.body;
        const newContact = new Contact(req.body);
        await newContact.save();

        await resend.emails.send({
            from: 'RR Villa Contact <onboarding@resend.dev>',
            to: 'dishaamin72@gmail.com',
            subject: `📩 Contact Form: ${subject}`,
            html: `<h3>New Inquiry</h3><p><b>From:</b> ${fullName}</p><p><b>Message:</b> ${message}</p><p><b>Phone:</b> ${phone}</p>`
        });

        res.status(200).json({ success: true, message: "Message sent!" });
    } catch (error) {
        console.error("Contact Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ RR Villa server live on port ${PORT}`);
});