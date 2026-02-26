const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend'); // 1. Switched from nodemailer to resend
require('dotenv').config();

const app = express();

// --- INITIALIZE RESEND ---
const resend = new Resend(process.env.RESEND_API_KEY);

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- MONGODB CONNECTION ---
const mongoURI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/RR_Villa_DB';

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
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

// --- ROUTES ---

// 1. BOOKING ROUTE (Now using Resend)
app.post('/api/bookings/create', async (req, res) => {
    try {
        const { name, email, event_type, date, phone, guests, message } = req.body;

        // Save to Database
        const newBooking = new Booking(req.body);
        await newBooking.save();

        // A. Notify Admin via Resend
        await resend.emails.send({
            from: 'RR Villa Admin <onboarding@resend.dev>',
            to: 'dishaamin72@gmail.com', 
            subject: `🚨 New Booking: ${event_type} - ${name}`,
            html: `<h3>New Booking Request</h3>
                   <p><b>Name:</b> ${name}</p>
                   <p><b>Event:</b> ${event_type}</p>
                   <p><b>Date:</b> ${date}</p>
                   <p><b>Phone:</b> ${phone}</p>
                   <p><b>Message:</b> ${message || "None"}</p>`
        });

        // B. Auto-reply to User (Only works if user's email is your verified test email on Resend Free)
        await resend.emails.send({
            from: 'RR Villa <onboarding@resend.dev>',
            to: email, 
            subject: `Booking Confirmed - RR Villa`,
            html: `<h3>Hello ${name},</h3>
                   <p>Your booking request for <b>${event_type}</b> on <b>${date}</b> has been received.</p>
                   <p>We will contact you shortly at ${phone}.</p>`
        });

        res.status(201).json({ success: true, message: "Booking saved and notifications sent via Resend" });
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. CONTACT ROUTE (Now using Resend)
app.post('/api/contact', async (req, res) => {
    try {
        const { fullName, email, subject, message } = req.body;

        const newContact = new Contact(req.body);
        await newContact.save();

        // A. Email to ADMIN
        await resend.emails.send({
            from: 'RR Villa Contact <onboarding@resend.dev>',
            to: 'dishaamin72@gmail.com',
            subject: `📩 Contact Form: ${subject}`,
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
                    <h3 style="color: #2d6a4f;">New Inquiry Received</h3>
                    <p><b>From:</b> ${fullName} (${email})</p>
                    <p><b>Subject:</b> ${subject}</p>
                    <p><b>Message:</b> ${message}</p>
                   </div>`
        });

        // B. Email to USER
        await resend.emails.send({
            from: 'RR Villa <onboarding@resend.dev>',
            to: email,
            subject: `We've received your message - RR Villa`,
            html: `<div style="font-family: Arial; padding: 20px; color: #333;">
                    <h3>Hello ${fullName},</h3>
                    <p>Thank you for reaching out to <b>RR Villa</b>.</p>
                    <p>We have received your message regarding "<b>${subject}</b>" and our team will get back to you soon.</p>
                   </div>`
        });

        res.status(200).json({ success: true, message: "Inquiry sent via Resend API" });
    } catch (error) {
        console.error("Contact Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- SERVER START ---
const PORT = process.env.PORT || 8080;
// Note: "0.0.0.0" is required for Railway to properly expose the port
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ RR Villa server live on port ${PORT}`);
});