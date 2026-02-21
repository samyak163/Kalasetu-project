/**
 * @file notificationModel.js — In-App Notification Schema
 * @collection notifications
 *
 * Stores in-app notifications for both Users and Artisans.
 * Displayed in the notification panel dropdown in the frontend header.
 *
 * Polymorphic owner (dual-auth aware):
 *  - ownerId + ownerType — Either 'user' or 'artisan'
 *    Allows a single notifications collection to serve both account types.
 *
 * Key fields:
 *  - title — Short notification headline
 *  - text  — Notification body message
 *  - url   — Deep link to relevant page (e.g., booking detail)
 *  - read  — Whether the user has seen/dismissed this notification
 *
 * Compound index on (ownerId, ownerType, createdAt DESC) for efficient
 * "get my recent notifications" queries.
 *
 * @exports {Model} Notification — Mongoose model
 *
 * @see utils/notificationService.js — Creates notifications
 * @see controllers/notificationController.js — List, mark as read, delete
 * @see kalasetu-frontend/src/context/NotificationContext.jsx — Frontend polling
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
  ownerType: { type: String, enum: ['user', 'artisan'], required: true, index: true, default: 'user' },
  title: { type: String, default: '' },
  text: { type: String, required: true },
  url: { type: String, default: '' },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

notificationSchema.index({ ownerId: 1, ownerType: 1, createdAt: -1 });
// Auto-delete notifications older than 90 days (ephemeral data, same pattern as otpModel TTL)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;


