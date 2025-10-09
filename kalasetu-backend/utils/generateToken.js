import jwt from 'jsonwebtoken';

// This function is our "Security Badge Maker".
// It takes a user's or artisan's unique ID from the database.
const generateToken = (id) => {
    // We use the jwt.sign() method to create the token.
    // It combines the user's ID with our secret key from the .env file.
    // The 'expiresIn' option means the badge will be valid for 30 days.
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export default generateToken;