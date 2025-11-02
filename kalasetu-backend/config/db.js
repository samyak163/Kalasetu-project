import mongoose from 'mongoose';
import { DATABASE_CONFIG } from './env.config.js';

// This function connects our application to the MongoDB Atlas database
const connectDB = async () => {
    try {
        // It reads the MONGO_URI from the env.config.js
        const conn = await mongoose.connect(DATABASE_CONFIG.mongoUri, DATABASE_CONFIG.options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // This will stop the application if the database connection fails
    }
};

export default connectDB;