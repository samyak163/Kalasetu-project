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

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;


