/**
 * @file callHistoryModel.js — Video/Voice Call History Schema
 * @collection callhistories
 *
 * Logs every video or voice call between an artisan and a user.
 * Created when a Daily.co call starts, updated when it ends.
 *
 * Key fields:
 *  - artisan, user  — Call participants
 *  - startedAt, endedAt, durationSec — Timing
 *  - type           — 'voice' or 'video'
 *  - status         — 'completed', 'missed', or 'cancelled'
 *
 * Indexed for:
 *  - Artisan's call history (artisan + startedAt DESC)
 *  - User's call history (user + startedAt DESC)
 *
 * @exports {Model} CallHistory — Mongoose model
 *
 * @see controllers/callHistoryController.js — History retrieval
 * @see controllers/videoController.js — Daily.co room creation
 */

import mongoose from 'mongoose';

const callHistorySchema = new mongoose.Schema({
  roomName: { type: String, default: '' },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  durationSec: { type: Number, default: 0 },
  type: { type: String, enum: ['voice', 'video'], default: 'video' },
  status: { type: String, enum: ['active', 'completed', 'missed', 'cancelled'], default: 'completed' },
}, { timestamps: true });

callHistorySchema.index({ artisan: 1, startedAt: -1 });
callHistorySchema.index({ user: 1, startedAt: -1 });

const CallHistory = mongoose.model('CallHistory', callHistorySchema);
export default CallHistory;


