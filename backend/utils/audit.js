const AuditLog = require('../models/AuditLog');

const createAudit = async ({ action, resource, resourceId, user, details, req }) => {
  try {
    await AuditLog.create({
      action,
      resource,
      resourceId,
      user: user?._id,
      userName: user?.name,
      details,
      ip: req?.ip || req?.headers?.['x-forwarded-for']?.split(',')[0] || undefined,
      userAgent: req?.headers?.['user-agent']
    });
  } catch (error) {
    // Failures here should not break the main request
    /* eslint-disable no-console */
    console.error('Audit log failed:', error.message);
    /* eslint-enable no-console */
  }
};

module.exports = { createAudit };