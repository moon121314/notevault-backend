const mongoose = require('mongoose');
const User = require('../models/User');
const Note = require('../models/Note');
const Post = require('../models/Post');
const getPagination = require('../utils/pagination');

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, interests: u.interests });

exports.addUser = async (req, res) => {
  const { name, email, password, role, interests } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Required fields missing' });
  const user = await User.create({ name, email, password, role, interests });
  res.status(201).json({ data: publicUser(user) });
};

exports.listUsers = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  res.json({ data: items.map(publicUser), pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 } });
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid user id' });
  const user = await User.findById(id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  const { name, email, password, role, interests } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (interests !== undefined) user.interests = interests;
  if (password) user.password = password;
  
  await user.save();
  res.json({ data: publicUser(user) });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid user id' });
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  await Note.deleteMany({ owner: user._id });
  await Post.deleteMany({ user: user._id });
  await user.deleteOne();
  res.json({ message: 'User removed' });
};

exports.listAllNotes = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Note.find().populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(),
  ]);
  res.json({ data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 } });
};