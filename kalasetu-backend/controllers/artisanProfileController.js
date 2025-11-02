import Artisan from '../models/artisanModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';
import cloudinary from '../config/cloudinary.js';
import { encrypt, decrypt, isEncryptionEnabled, maskAccountNumber } from '../utils/crypto.js';
import { logAudit } from '../utils/audit.js';
import { sendEmail } from '../utils/email.js';
import fs from 'node:fs/promises';

// ---------- Zod Schemas ----------
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:MM 24h

const daySchema = z.object({
  start: z.string().regex(timeRegex, 'Invalid time format HH:MM').optional().or(z.literal('')),
  end: z.string().regex(timeRegex, 'Invalid time format HH:MM').optional().or(z.literal('')),
  active: z.boolean().optional(),
});

const workingHoursSchema = z.object({
  monday: daySchema.optional(),
  tuesday: daySchema.optional(),
  wednesday: daySchema.optional(),
  thursday: daySchema.optional(),
  friday: daySchema.optional(),
  saturday: daySchema.optional(),
  sunday: daySchema.optional(),
}).refine((wh) => {
  const toMin = (t) => {
    const [h, m] = (t || '').split(':');
    return Number(h) * 60 + Number(m);
  };
  const days = Object.keys(wh || {});
  for (const d of days) {
    const v = wh[d];
    if (!v) continue;
    if (v.active) {
      if (!v.start || !v.end) return false;
      if (toMin(v.start) === toMin(v.end)) return false;
    }
  }
  return true;
}, { message: 'For active days, start and end must be set and not equal' });

const profileUpdateSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  businessName: z.string().max(160).optional(),
  tagline: z.string().max(160).optional(),
  bio: z.string().max(500).optional(),
  craft: z.string().max(120).optional(),
  phoneNumber: z.string().max(20).optional(),
  businessPhone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  whatsappNumber: z.string().max(20).optional(),
  yearsOfExperience: z.string().optional(),
  teamSize: z.string().optional(),
  languagesSpoken: z.array(z.string()).max(20).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuingAuthority: z.string().optional(),
    certificateNumber: z.string().optional(),
    certificateUrl: z.string().url().optional(),
    issueDate: z.string().datetime().optional(),
    expiryDate: z.string().datetime().optional(),
  })).optional(),
  // Work Preferences
  workingHours: workingHoursSchema.optional(),
  emergencyServices: z.boolean().optional(),
  serviceRadius: z.number().min(0).max(200).optional(),
  minimumBookingNotice: z.number().min(0).max(168).optional(),
  // Business
  businessType: z.enum(['individual','small_business','company']).optional(),
  gstNumber: z.string().max(32).optional(),
});

const documentsUpdateSchema = z.object({
  aadhar: z.object({ url: z.string().url().optional(), number: z.string().max(32).optional() }).partial().optional(),
  pan: z.object({ url: z.string().url().optional(), number: z.string().max(32).optional() }).partial().optional(),
  policeVerification: z.object({ url: z.string().url().optional() }).partial().optional(),
  businessLicense: z.object({ url: z.string().url().optional(), number: z.string().max(64).optional() }).partial().optional(),
  insurance: z.object({ url: z.string().url().optional(), expiryDate: z.string().datetime().optional() }).partial().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one document is required' });

const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(2).max(120),
  accountNumber: z.string().min(6).max(32),
  ifscCode: z.string().min(4).max(20),
  bankName: z.string().min(2).max(120),
  branchName: z.string().max(120).optional().default(''),
});

// ---------- Controllers ----------

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const artisan = await Artisan.findById(userId).select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpires');
  if (!artisan) return res.status(404).json({ message: 'Artisan not found' });

  // Decrypt bank account for owner view
  const data = artisan.toObject();
  if (data.bankDetails?.accountNumber) {
    const raw = decrypt(data.bankDetails.accountNumber);
    data.bankDetails.accountNumberMasked = maskAccountNumber(raw);
    // Do not expose full number by default; provide masked + a flag
    data.bankDetails.encrypted = isEncryptionEnabled();
    delete data.bankDetails.accountNumber; // prevent leaking raw/encrypted string
  }

  res.json({ success: true, data });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const payload = profileUpdateSchema.parse(req.body);

  // Sanitize immutable/sensitive fields
  const disallowed = ['publicId', 'password', 'loginAttempts', 'lockUntil'];
  for (const k of disallowed) {
    // eslint-disable-next-line no-param-reassign
    delete payload[k];
  }

  const updated = await Artisan.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updated) return res.status(404).json({ message: 'Artisan not found' });
  await logAudit(userId, 'profile.update', { changes: Object.keys(payload), ip: req.ip, ua: req.get('user-agent') });
  res.json({ success: true, data: updated });
});

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  // Upload to cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'kalasetu/artisan/profiles',
    overwrite: true,
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }, { quality: 'auto', fetch_format: 'auto' }],
  });

  const updated = await Artisan.findByIdAndUpdate(
    userId,
    { $set: { profileImageUrl: result.secure_url, profileImagePublicId: result.public_id } },
    { new: true }
  ).select('-password');
  try { await fs.unlink(req.file.path); } catch {}
  await logAudit(userId, 'profile.photo.update', { publicId: result.public_id });
  res.json({ success: true, data: { profileImageUrl: updated.profileImageUrl } });
});

export const deleteProfilePhoto = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const artisan = await Artisan.findById(userId).select('profileImagePublicId');
  if (!artisan) return res.status(404).json({ message: 'Artisan not found' });

  if (artisan.profileImagePublicId) {
    try { await cloudinary.uploader.destroy(artisan.profileImagePublicId); } catch {}
  }

  const placeholder = 'https://placehold.co/100x100/A55233/FFFFFF?text=Profile';
  await Artisan.findByIdAndUpdate(userId, { $set: { profileImageUrl: placeholder, profileImagePublicId: '' } });
  await logAudit(userId, 'profile.photo.delete');
  res.json({ success: true, data: { profileImageUrl: placeholder } });
});

export const updateDocuments = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const payload = documentsUpdateSchema.parse(req.body || {});

  const setObj = {};
  if (payload.aadhar) setObj['verificationDocuments.aadhar'] = { ...payload.aadhar, verified: false };
  if (payload.pan) setObj['verificationDocuments.pan'] = { ...payload.pan, verified: false };
  if (payload.policeVerification) setObj['verificationDocuments.policeVerification'] = { ...payload.policeVerification, verified: false };
  if (payload.businessLicense) setObj['verificationDocuments.businessLicense'] = { ...payload.businessLicense, verified: false };
  if (payload.insurance) setObj['verificationDocuments.insurance'] = { ...payload.insurance, verified: false };

  const updated = await Artisan.findByIdAndUpdate(userId, { $set: setObj }, { new: true }).select('-password');
  await logAudit(userId, 'profile.documents.update', { fields: Object.keys(setObj) });
  res.json({ success: true, data: updated.verificationDocuments });
});

export const getVerificationStatus = asyncHandler(async (req, res) => {
  const user = await Artisan.findById(req.user._id || req.user.id).select('verificationDocuments');
  if (!user) return res.status(404).json({ message: 'Artisan not found' });
  res.json({ success: true, data: user.verificationDocuments || {} });
});

export const updateBankDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const payload = bankDetailsSchema.parse(req.body);

  // Encrypt account number if possible
  const secure = {
    accountHolderName: payload.accountHolderName,
    accountNumber: encrypt(payload.accountNumber),
    ifscCode: payload.ifscCode,
    bankName: payload.bankName,
    branchName: payload.branchName || '',
    verified: false,
  };

  await Artisan.findByIdAndUpdate(userId, { $set: { bankDetails: secure } });
  await logAudit(userId, 'profile.bank.update');
  res.json({ success: true, data: { ...secure, accountNumber: undefined, accountNumberMasked: maskAccountNumber(payload.accountNumber), encrypted: isEncryptionEnabled() } });
});

// Upload a verification document file and attach URL to corresponding field
export const uploadDocument = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { type = '' } = req.query; // aadhar | pan | policeVerification | businessLicense | insurance
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const allowed = new Set(['aadhar','pan','policeVerification','businessLicense','insurance']);
  if (!allowed.has(type)) return res.status(400).json({ message: 'Invalid document type' });

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: `kalasetu/artisan/documents/${type}`,
    overwrite: false,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  try { await fs.unlink(req.file.path); } catch {}

  const path = `verificationDocuments.${type}.url`;
  const verifiedPath = `verificationDocuments.${type}.verified`;
  const updated = await Artisan.findByIdAndUpdate(userId, { $set: { [path]: result.secure_url, [verifiedPath]: false } }, { new: true }).select('-password');
  await logAudit(userId, 'profile.documents.upload', { type });
  res.json({ success: true, data: { type, url: result.secure_url, doc: updated.verificationDocuments?.[type] } });
});

// Edit-once slug update
const slugSchema = z.object({ slug: z.string().min(3).max(40).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, and hyphens only') });

export const updateSlug = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { slug } = slugSchema.parse(req.body);
  const user = await Artisan.findById(userId).select('slug');
  if (!user) return res.status(404).json({ message: 'Artisan not found' });
  if (user.slug) return res.status(400).json({ message: 'Slug already set and cannot be changed' });
  const exists = await Artisan.findOne({ slug });
  if (exists) return res.status(409).json({ message: 'Slug already taken' });
  await Artisan.findByIdAndUpdate(userId, { $set: { slug } });
  await logAudit(userId, 'profile.slug.set', { slug });
  res.json({ success: true, data: { slug } });
});

// Email OTP re-verification
const emailInitSchema = z.object({ newEmail: z.string().email() });
export const initiateEmailVerification = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { newEmail } = emailInitSchema.parse(req.body);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  await Artisan.findByIdAndUpdate(userId, { $set: { pendingEmail: newEmail, emailVerificationCode: code, emailVerificationExpires: expires } });
  // Send code via email to newEmail
  await sendEmail({ to: newEmail, subject: 'Verify your new email', text: `Your KalaSetu verification code is ${code}. It expires in 15 minutes.` });
  await logAudit(userId, 'profile.email.verify.initiate', { newEmail });
  res.json({ success: true });
});

const emailConfirmSchema = z.object({ code: z.string().min(4).max(6) });
export const confirmEmailVerification = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { code } = emailConfirmSchema.parse(req.body);
  const user = await Artisan.findById(userId).select('pendingEmail emailVerificationCode emailVerificationExpires email');
  if (!user?.pendingEmail || !user.emailVerificationCode || !user.emailVerificationExpires) {
    return res.status(400).json({ message: 'No pending verification' });
  }
  if (new Date(user.emailVerificationExpires).getTime() < Date.now()) {
    return res.status(400).json({ message: 'Verification code expired' });
  }
  if (code !== user.emailVerificationCode) {
    return res.status(400).json({ message: 'Invalid code' });
  }
  await Artisan.findByIdAndUpdate(userId, { $set: { email: user.pendingEmail, pendingEmail: '', emailVerificationCode: '', emailVerificationExpires: null } });
  await logAudit(userId, 'profile.email.verify.confirm');
  res.json({ success: true });
});

// Phone OTP scaffold (no SMS provider configured). Returns 501.
export const initiatePhoneVerification = asyncHandler(async (req, res) => {
  return res.status(501).json({ message: 'SMS provider not configured' });
});

export const confirmPhoneVerification = asyncHandler(async (req, res) => {
  return res.status(501).json({ message: 'SMS provider not configured' });
});
