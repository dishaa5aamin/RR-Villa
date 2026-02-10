const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const transporter = require("../config/mailer");


// ================= SEND CONTACT MESSAGE =================
router.post("/contact", async (req, res) => {

    try {

        const { name, email, message } = req.body;

        // ✅ Validation
        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields required" });
        }

        const contact = new Contact({
            name,
            email,
            message
        });

        await contact.save();

        // 📧 Send Email To Admin
        await transporter.sendMail({
            from: '"Villa Resort Website" <dishaamin72@gmail.com>',
            to: "dishaamin72@gmail.com",
            subject: "📩 New Contact Message",
            html: `
                <h2>New Contact Message</h2>

                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>

                <hr>

                <p><b>Message:</b></p>
                <p>${message}</p>
            `
        });

        res.json({ message: "Message sent successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }

});


// ================= GET ALL CONTACT MESSAGES (ADMIN) =================
router.get("/contacts", async (req, res) => {

    try {

        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }

});


module.exports = router;
