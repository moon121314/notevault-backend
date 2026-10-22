const User = require('../models/User');
const signToken = require('../utils/token');

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, interests: u.interests });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Required fields missing' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, role: 'user' });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Required fields missing' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

  res.json({ token: signToken(user), user: publicUser(user) });
};

exports.me = async (req, res) => res.json({ user: publicUser(req.user) });