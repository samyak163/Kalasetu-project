import mongoose from 'mongoose';

const callHistorySchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  durationSec: { type: Number, default: 0 },
  type: { type: String, enum: ['voice', 'video'], default: 'video' },
  status: { type: String, enum: ['completed', 'missed', 'cancelled'], default: 'completed' },
}, { timestamps: true });

callHistorySchema.index({ artisan: 1, startedAt: -1 });
callHistorySchema.index({ user: 1, startedAt: -1 });

const CallHistory = mongoose.model('CallHistory', callHistorySchema);
export default CallHistory;


