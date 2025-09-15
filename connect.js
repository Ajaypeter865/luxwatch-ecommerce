const mongoose = require('mongoose');
const urls = process.env.DB_URI;

async function connectMongoDB() {
    if (!urls) {
        throw new Error("DB_URI is not defined in .env file");
    }
    try {
        await mongoose.connect(urls);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); // stop server if DB fails
    }
}

module.exports = { connectMongoDB };
