const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userName: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);