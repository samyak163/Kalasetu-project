import mongoose from 'mongoose';
import { DATABASE_CONFIG } from './env.config.js';

// This function connects our application to the MongoDB Atlas database
const connectDB = async () => {
    try {
        // It reads the MONGO_URI from the env.config.js
        // Add timeout settings to prevent hanging
        const options = {
            ...DATABASE_CONFIG.options,
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 10000, // 10 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 2, // Maintain at least 2 socket connections
        };
        const conn = await mongoose.connect(DATABASE_CONFIG.mongoUri, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // This will stop the application if the database connection fails
    }
};

export default connectDB;