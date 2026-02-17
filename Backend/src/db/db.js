import mongoose from 'mongoose';
import config from "../config/config.js";

async function connectDB() {
    try {
        // Disable Mongoose buffering to fail fast if connection fails
        mongoose.set('bufferCommands', false);
        
        console.log('🔄 Connecting to MongoDB...');
        
        const connection = await mongoose.connect(config.MONGODB_URL, {
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('✅ MongoDB connected successfully');
        console.log(`   Host: ${connection.connection.host}`);
        console.log(`   Database: ${connection.connection.name}`);
        
        return connection;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('   Make sure MongoDB is running and accessible');
        process.exit(1); // Exit process if DB connection fails
    }
}

export default connectDB;