/**
 * @file db.js — MongoDB Connection Setup
 *
 * Establishes and manages the Mongoose connection to MongoDB Atlas.
 * Called once during server startup in server.js.
 *
 * Connection strategy:
 *  - Reads MONGO_URI from env.config.js (sourced from .env)
 *  - Applies timeout and pool size settings to prevent hanging connections
 *  - Exits the process on connection failure (fail-fast in production)
 *
 * @exports {Function} connectDB - Async function that connects to MongoDB
 *
 * @requires mongoose
 * @requires ./env.config.js — DATABASE_CONFIG (mongoUri, options)
 *
 * @see server.js — Where connectDB() is invoked on startup
 * @see env.config.js — Where MONGO_URI and database options are defined
 */

import mongoose from 'mongoose';
import { DATABASE_CONFIG } from './env.config.js';

/**
 * Connect to MongoDB Atlas with configured timeouts and connection pooling.
 *
 * Pool sizing rationale:
 *  - maxPoolSize: 10 — sufficient for moderate concurrent requests
 *  - minPoolSize: 2  — keeps warm connections to reduce cold-start latency
 *
 * On failure, process.exit(1) halts startup — the server cannot function without a database.
 */
const connectDB = async () => {
    try {
        const options = {
            ...DATABASE_CONFIG.options,
            serverSelectionTimeoutMS: 10000, // 10s — max wait to find a suitable server
            socketTimeoutMS: 45000,          // 45s — max idle time on a socket before closing
            connectTimeoutMS: 10000,         // 10s — max wait for initial connection
            maxPoolSize: 10,                 // Upper bound on concurrent socket connections
            minPoolSize: 2,                  // Keep-alive connections for low-latency queries
        };
        const conn = await mongoose.connect(DATABASE_CONFIG.mongoUri, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;