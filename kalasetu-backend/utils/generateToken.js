import jwt from 'jsonwebtoken';

// Generates a JWT for a given user id
export const signJwt = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// Sets the JWT in an HTTP-only cookie
export const setAuthCookie = (res, token) => {
    res.cookie(process.env.COOKIE_NAME || 'ks_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Clears the auth cookie
export const clearAuthCookie = (res) => {
    res.clearCookie(process.env.COOKIE_NAME || 'ks_auth', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
    });
};