import mongoose from 'mongoose';

// This function connects our application to the MongoDB Atlas database
const connectDB = async () => {
    try {
        // It reads the MONGO_URI from your .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // This will stop the application if the database connection fails
    }
};

export default connectDB;