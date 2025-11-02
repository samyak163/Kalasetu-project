import Artisan from '../models/artisanModel.js';

/**
 * Log an audit entry for an artisan action
 * Keep it simple: store in a capped collection if needed later
 */
import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', index: true },
  action: { type: String, index: true },
  meta: { type: Object, default: {} },
  ip: { type: String },
  ua: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);

export async function logAudit(artisanId, action, meta = {}) {
  try {
    await AuditLog.create({ artisanId, action, meta, ip: meta.ip, ua: meta.ua });
  } catch (e) {
    // Do not block main flow on audit failure
    console.warn('Audit log failed:', e.message);
  }
}

export default { logAudit };
