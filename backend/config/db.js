const mongoose = require('mongoose');
const path = require('path');

if (!process.env.MONGODB_URI) {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

module.exports = mongoose.connection;

