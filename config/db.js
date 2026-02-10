const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Using 127.0.0.1 is more stable for local MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/villaResort');
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;

