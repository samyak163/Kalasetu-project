import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import artisanRoutes from './routes/artisanRoutes.js'; 

// --- Load Environment Variables ---
// This line loads the variables from your .env file (like PORT and MONGO_URI)
dotenv.config();

// --- Connect to Database ---
// We call the function we will create in config/db.js
connectDB();

const app = express();

// --- Middleware ---
// CORS allows our frontend (on localhost:5174 or Vercel) to make requests to our backend (on localhost:5000 or Render)
app.use(cors());
// This allows our server to understand and process incoming JSON data from request bodies
app.use(express.json());

// --- Simple Test Route ---
// This is a basic "health check" to make sure our server is alive.
app.get('/', (req, res) => {
    res.send('KalaSetu API is running...');
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

app.use('/api/artisans', artisanRoutes); 

