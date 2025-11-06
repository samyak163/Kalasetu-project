import Admin from '../models/adminModel.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Account is suspended' });
    }
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    admin.lastLogin = new Date();
    admin.loginHistory.push({ timestamp: new Date(), ipAddress: req.ip, userAgent: req.get('user-agent') });
    if (admin.loginHistory.length > 20) {
      admin.loginHistory = admin.loginHistory.slice(-20);
    }
    await admin.save();
    const token = admin.getSignedJwtToken();
    const cookieName = 'admin_token';
    // Set cookie for cross-site usage (Vercel frontend -> Render backend)
    // In production, use SameSite=None and Secure=true so the browser will send it on cross-site requests
    // In development, relax to SameSite=Lax so it works on http://localhost
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    };
    res.cookie(cookieName, token, cookieOptions);
    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        profileImage: admin.profileImage
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);
    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        profileImage: admin.profileImage,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logout = async (req, res) => {
  res.cookie('admin_token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user._id).select('+password');
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    admin.password = newPassword;
    await admin.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


