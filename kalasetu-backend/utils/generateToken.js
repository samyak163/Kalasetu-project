import jwt from 'jsonwebtoken';

// Generates a JWT for a given user id with account type claim
// Type claim prevents cross-type token reuse (artisan token used as user or vice versa)
export const signJwt = (id, type = 'artisan') => {
    return jwt.sign({ id, type }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// Sets the JWT in an HTTP-only cookie
export const setAuthCookie = (res, token) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(process.env.COOKIE_NAME || 'ks_auth', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Clears the auth cookie
export const clearAuthCookie = (res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie(process.env.COOKIE_NAME || 'ks_auth', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
    });
};