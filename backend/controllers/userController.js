const User = require('../models/User');
const { createAudit } = require('../utils/audit');

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const query = { isActive: true };
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, role });

    await createAudit({
      action: 'create',
      resource: 'user',
      resourceId: user._id,
      user: req.user,
      details: { name, email, role }
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates = ['name', 'email', 'role', 'isActive'];
    updates.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.body.password) {
      user.password = req.body.password;
    }

    const changedFields = {};
    ['name', 'email', 'role', 'isActive'].forEach((field) => {
      if (req.body[field] !== undefined) changedFields[field] = req.body[field];
    });
    if (req.body.password) changedFields.password = 'updated';

    await user.save();

    await createAudit({
      action: 'update',
      resource: 'user',
      resourceId: user._id,
      user: req.user,
      details: changedFields
    });

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    await createAudit({
      action: 'deactivate',
      resource: 'user',
      resourceId: user._id,
      user: req.user,
      details: { email: user.email, name: user.name }
    });

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deactivateUser }; 