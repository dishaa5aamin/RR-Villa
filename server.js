const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 8080;

// --- MIDDLEWARE ---
app.use(cors()); // Allows frontend to talk to backend
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- MONGODB CONNECTION ---
mongoose.connect('mongodb://127.0.0.1:27017/RR_Villa_DB')
    .then(() => console.log('✅ Connected to MongoDB Compass'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// --- MODELS ---
// Booking Model - Added explicit collection name 'bookings'
const Booking = mongoose.model('Booking', new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    event_type: String,
    date: String,
    guests: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
}), 'bookings'); // <--- Adding this 3rd argument ensures it saves to 'bookings'

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
        pass: 'tinxievrgkavzkzc' // Ensure this App Password is still valid        
    }
});

// --- ROUTES ---

// 1. BOOKING ROUTE
app.post('/api/bookings/create', async (req, res) => {
    console.log("📩 Booking Attempt Received:", req.body);
    try {
        const { name, email, phone, event_type, date, guests, message } = req.body;

        // 1. Save to MongoDB
        const newBooking = new Booking(req.body);
        await newBooking.save();
        console.log("💾 Saved to MongoDB");

        // 2. Prepare Emails
        const adminMail = {
            from: 'dishaamin72@gmail.com',
            to: 'dishaamin72@gmail.com', 
            subject: `🚨 New Booking Alert: ${event_type}`,
            html: `<div style="font-family: Arial; border: 1px solid #ddd; padding: 20px;">
                    <h2 style="color: #1b4332;">New Booking Request</h2>
                    <p><b>Name:</b> ${name}</p>
                    <p><b>Event:</b> ${event_type}</p>
                    <p><b>Date:</b> ${date}</p>
                    <p><b>Phone:</b> ${phone}</p>
                    <p><b>Guests:</b> ${guests}</p>
                    <p><b>Message:</b> ${message}</p>
                   </div>`
        };

        const userMail = {
            from: 'dishaamin72@gmail.com',
            to: email,
            subject: 'Confirmation: RR Villa Booking',
            html: `<p>Hello ${name},</p><p>We have received your booking request for <b>${date}</b>. Our team will contact you shortly to confirm the details!</p><p>Best Regards,<br>RR Villa Team</p>`
        };

        // 3. Send Emails
        await transporter.sendMail(adminMail);
        await transporter.sendMail(userMail);
        console.log("📧 Emails Sent Successfully");

        res.status(201).json({ success: true, message: "Booking created and emails sent" });
    } catch (error) {
        console.error("❌ Route Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. CONTACT ROUTE
app.post('/api/contact', async (req, res) => {
    try {
        const { fullName, email, subject, message } = req.body;
        const newContact = new Contact(req.body);
        await newContact.save();

        const adminContactMail = {
            from: 'dishaamin72@gmail.com',
            to: 'dishaamin72@gmail.com',
            subject: `✉️ New Contact Message: ${subject}`,
            html: `<p><b>From:</b> ${fullName} (${email})</p><p><b>Message:</b> ${message}</p>`
        };

        const userContactMail = {
            from: 'dishaamin72@gmail.com',
            to: email,
            subject: 'We received your message - RR Villa',
            html: `<p>Hi ${fullName}, thank you for contacting us!</p>`
        };

        await transporter.sendMail(adminContactMail);
        await transporter.sendMail(userContactMail);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ Contact Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});