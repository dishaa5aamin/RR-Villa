const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// --- 1. DATABASE CONNECTION ---
// We use process.env.MONGODB_URI for Render, or your link for local testing.
const dbURI = process.env.MONGODB_URI || "mongodb+srv://dishaamin05:owtgPVZ4HmunNHFA@villaresortcluster.qqetyd0.mongodb.net/VillaResortDB?retryWrites=true&w=majority";

mongoose.connect(dbURI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ Database Connection Error:", err.message));

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
    const authHeader = req.headers.authorization || '';
    const [login, password] = Buffer.from(authHeader.split(' ')[1] || '', 'base64').toString().split(':');
    if (login === ADMIN_USER && password === ADMIN_PASS) return next();
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
};

// --- 5. ROUTES ---
app.post('/api/bookings', async (req, res) => {
    try {
        await new Booking(req.body).save();
        await transporter.sendMail({
            from: '"Villa Admin" <dishaamin72@gmail.com>',
            to: 'dishaamin72@gmail.com',
            subject: '🚨 New Booking',
            text: `Booking by ${req.body.fullName}`
        });
        res.status(200).json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contact', async (req, res) => {
    try {
        await new Contact(req.body).save();
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

// --- 7. SERVER START (Render-ready) ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server live on port ${PORT}`);
});