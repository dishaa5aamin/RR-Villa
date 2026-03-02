const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const path = require('path');

const { Resend } = require('resend');

require('dotenv').config();



const app = express();




const resend = new Resend(process.env.RESEND_API_KEY);



// --- MIDDLEWARE ---

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));



const mongoURI = process.env.MONGO_URI;



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



app.post('/api/bookings/create', async (req, res) => {

    try {

        const { name, email, event_type, date, phone, guests, message } = req.body;



        const newBooking = new Booking(req.body);

        await newBooking.save();



        

        await resend.emails.send({

            from: 'RR Villa Admin <onboarding@resend.dev>',

            to: 'dishaamin72@gmail.com', 

            subject: `🚨 New Booking: ${event_type}`,

            html: `<p>New booking from ${name} for ${date}.</p><p><b>Phone:</b> ${phone}</p>`

        });



        

        await resend.emails.send({

            from: 'RR Villa <onboarding@resend.dev>',

            to: email, 

            subject: `Booking Confirmed - RR Villa`,

            html: `<h3>Hello ${name},</h3><p>We received your request for ${event_type}.</p>`

        });



        res.status(201).json({ success: true, message: "Booking saved!" });

    } catch (error) {

        console.error("Email Error:", error);


        res.status(201).json({ success: true, message: "Booking saved (Email restricted)" });

    }

});





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