import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import Payment from '../models/paymentModel.js';
import Review from '../models/reviewModel.js';
import { indexArtisan } from '../utils/algolia.js';

dotenv.config();

const SHOWCASE_ARTISAN_EMAIL = 'showcase.artisan@demo.kalasetu.com';
const SHOWCASE_USER_EMAIL = 'showcase.user@demo.kalasetu.com';
const SHOWCASE_BOOKING_NOTES = 'On-site consultation for handcrafted home décor curation.';

async function ensureArtisan() {
  let artisan = await Artisan.findOne({ email: SHOWCASE_ARTISAN_EMAIL });

  if (!artisan) {
    artisan = new Artisan({
      fullName: 'KalaSetu Showcase Artisan',
      email: SHOWCASE_ARTISAN_EMAIL,
      password: 'Demo@1234',
      craft: 'Handicrafts',
    });
  }

  artisan.bio = 'Award-winning artisan from Pune specialising in bespoke handcrafted décor and lifestyle gifts.';
  artisan.tagline = 'Turning Pune craftsmanship into unforgettable experiences';
  artisan.businessName = 'Showcase Crafts Studio';
  artisan.location = {
    type: 'Point',
    coordinates: [73.8567, 18.5204],
    address: 'FC Road, Pune, Maharashtra, India',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '411004',
  };
  artisan.languagesSpoken = ['English', 'Hindi', 'Marathi'];
  artisan.emailVerified = true;
  artisan.isVerified = true;
  artisan.isActive = true;
  artisan.averageRating = 4.9;
  artisan.totalReviews = 48;
  artisan.totalBookings = 260;
  artisan.totalEarnings = 420000;
  artisan.profileImageUrl = artisan.profileImageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80';
  artisan.portfolioImageUrls = [
    'https://images.unsplash.com/photo-1462396881884-de2c07cb95ed?w=800&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
    'https://images.unsplash.com/photo-1514996937319-344454492b37?w=800&q=80',
  ];

  await artisan.save();

  try {
    await indexArtisan(artisan);
  } catch (error) {
    console.warn('Algolia indexing skipped:', error.message);
  }

  return artisan;
}

async function ensureUser() {
  let user = await User.findOne({ email: SHOWCASE_USER_EMAIL });

  if (!user) {
    user = new User({
      fullName: 'KalaSetu Showcase User',
      email: SHOWCASE_USER_EMAIL,
      phoneNumber: '+91 98765 43210',
      password: 'Demo@1234',
    });
  }

  if (!user.password) {
    user.password = 'Demo@1234';
  }

  if (!user.phoneNumber) {
    user.phoneNumber = '+91 98765 43210';
  }

  await user.save();
  return user;
}

async function ensureBooking(userId, artisanId) {
  let booking = await Booking.findOne({ user: userId, artisan: artisanId });

  if (!booking) {
    booking = await Booking.create({
      artisan: artisanId,
      user: userId,
      start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: 'confirmed',
      notes: SHOWCASE_BOOKING_NOTES,
      price: 8500,
      depositPaid: true,
    });
  } else {
    booking.status = 'confirmed';
    booking.notes = SHOWCASE_BOOKING_NOTES;
    booking.price = 8500;
    booking.depositPaid = true;
    await booking.save();
  }

  return booking;
}

async function ensurePayment(userId, artisanId, booking) {
  const orderId = 'SHOWCASE-ORDER-001';

  let payment = await Payment.findOne({ orderId });

  if (!payment) {
    payment = await Payment.create({
      orderId,
      razorpayOrderId: 'rzp_showcase_demo_order',
      razorpayPaymentId: 'pay_showcase_demo_payment',
      amount: 850000, // in paise
      currency: 'INR',
      status: 'captured',
      payerId: userId,
      payerModel: 'User',
      recipientId: artisanId,
      recipientModel: 'Artisan',
      purpose: 'service',
      description: 'Handcrafted décor consultation and custom order',
      metadata: { bookingId: booking._id },
    });
  } else {
    payment.status = 'captured';
    payment.amount = 850000;
    payment.metadata = { ...(payment.metadata || {}), bookingId: booking._id };
    payment.recipientId = artisanId;
    payment.recipientModel = 'Artisan';
    payment.payerId = userId;
    payment.payerModel = 'User';
    await payment.save();
  }

  return payment;
}

async function ensureReview(userId, artisanId, bookingId) {
  let review = await Review.findOne({ user: userId, artisan: artisanId });

  if (!review) {
    review = await Review.create({
      user: userId,
      artisan: artisanId,
      booking: bookingId,
      rating: 5,
      comment: 'Exceptional craftsmanship! The consultation transformed my living room with locally made pieces.',
      isVerified: true,
    });
  } else {
    review.rating = 5;
    review.comment = 'Exceptional craftsmanship! The consultation transformed my living room with locally made pieces.';
    review.isVerified = true;
    review.booking = bookingId;
    await review.save();
  }

  return review;
}

async function main() {
  await connectDB();

  try {
    const [artisan, user] = await Promise.all([ensureArtisan(), ensureUser()]);
    const booking = await ensureBooking(user._id, artisan._id);
    await ensurePayment(user._id, artisan._id, booking);
    await ensureReview(user._id, artisan._id, booking._id);

    console.log('✅ Showcase data seeded successfully.');
  } catch (error) {
    console.error('❌ Failed to seed showcase data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

main();


