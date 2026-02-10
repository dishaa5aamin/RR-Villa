const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Crucial for mobile-to-server communication
app.use(express.json());

// --- 1. DATABASE CONNECTION (Updated with stability options) ---
const cloudDB = "mongodb+srv://dishaamin05:owtgPVZ4HmunNHFA@villaresortcluster.qqetyd0.mongodb.net/VillaResortDB?retryWrites=true&w=majority&appName=VillaResortCluster";

mongoose.connect(cloudDB, {
    serverSelectionTimeoutMS: 5000, // Keeps the server from hanging if DB is slow
    socketTimeoutMS: 45000,
})
.then(() => console.log("✅ Connected to MongoDB Atlas (Cloud)"))
.catch(err => {
    console.log("❌ Cloud DB Connection Error. Hint: Check your Atlas IP Whitelist!");
    console.error(err);
});

// --- 2. DATA MODELS ---
const Booking = mongoose.model('Booking', new mongoose.Schema({
    location: String, fullName: String, email: String, 
    checkIn: String, checkOut: String, guests: Number
}), 'all_bookings');

const Contact = mongoose.model('Contact', new mongoose.Schema({
    name: String, email: String, subject: String, message: String
}), 'contact_messages');

// --- 3. EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dishaamin72@gmail.com', 
        pass: 'omfjzdecdhsbyigf' 
    },
    tls: { rejectUnauthorized: false }
});

// --- 4. ADMIN SECURITY ---
const ADMIN_USER = "admin";
const ADMIN_PASS = "villa123";

const checkAuth = (req, res, next) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    if (login === ADMIN_USER && password === ADMIN_PASS) return next();
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
};

// --- 5. ROUTES: BOOKING & CONTACT ---
app.post('/api/bookings', async (req, res) => {
    try {
        await new Booking(req.body).save();
        await transporter.sendMail({
            from: '"Villa Admin" <dishaamin72@gmail.com>',
            to: 'dishaamin72@gmail.com',
            subject: '🚨 New Booking Alert',
            text: `New booking by ${req.body.fullName}`
        });
        await transporter.sendMail({
            from: '"Villa Resort" <dishaamin72@gmail.com>',
            to: req.body.email,
            subject: 'Booking Confirmed!',
            html: `<h3>Hi ${req.body.fullName}, your stay is confirmed!</h3>`
        });
        res.status(200).json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contact', async (req, res) => {
    try {
        await new Contact(req.body).save();
        await transporter.sendMail({
            from: '"Resort Inquiry" <dishaamin72@gmail.com>',
            to: 'dishaamin72@gmail.com',
            subject: `Inquiry: ${req.body.subject}`,
            text: `From: ${req.body.name}\nMessage: ${req.body.message}`
        });
        await transporter.sendMail({
            from: '"Villa Resort" <dishaamin72@gmail.com>',
            to: req.body.email,
            subject: 'We Received Your Message',
            html: `<h3>Thanks ${req.body.name}, we will reply shortly!</h3>`
        });
        res.status(200).json({ message: "Message Sent" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 6. ADMIN ROUTES ---
app.get('/api/admin/bookings', checkAuth, async (req, res) => {
    res.json(await Booking.find().sort({ _id: -1 }));
});

app.get('/api/admin/messages', checkAuth, async (req, res) => {
    res.json(await Contact.find().sort({ _id: -1 }));
});

app.delete('/api/admin/bookings/:id', checkAuth, async (req, res) => {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.delete('/api/admin/messages/:id', checkAuth, async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// --- 7. SERVER START (Updated for Global Mobile Access) ---
const PORT = process.env.PORT || 5000;
// We listen on 0.0.0.0 so that other devices (phones) on the network can find the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server active!`);
    console.log(`📡 Local: http://localhost:${PORT}`);
    console.log(`📱 Mobile: Use your computer's IP address on your phone.`);
});