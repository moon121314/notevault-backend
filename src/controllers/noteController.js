const mongoose = require('mongoose');
const Note = require('../models/Note');
const getPagination = require('../utils/pagination');

exports.createNote = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'title and content are required' });
  const note = await Note.create({ title, content, owner: req.user._id });
  res.status(201).json({ data: note });
};

exports.listMyNotes = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { owner: req.user._id };
  const [items, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);
  res.json({ data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 } });
};

exports.updateNote = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid note id' });
  const note = await Note.findById(id);
  if (!note) return res.status(404).json({ message: 'Note not found' });
  if (!note.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  if (req.body.title !== undefined) note.title = req.body.title;
  if (req.body.content !== undefined) note.content = req.body.content;
  await note.save();
  res.json({ data: note });
};

exports.deleteNote = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid note id' });
  const note = await Note.findById(id);
  if (!note) return res.status(404).json({ message: 'Note not found' });
  if (!note.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  await note.deleteOne();
  res.json({ message: 'Note deleted' });
};