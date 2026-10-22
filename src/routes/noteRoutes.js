const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');
const { createNote, listMyNotes, updateNote, deleteNote } = require('../controllers/noteController');

const router = express.Router();
router.use(protect);

router.route('/').get(asyncHandler(listMyNotes)).post(asyncHandler(createNote));
router.route('/:id').put(asyncHandler(updateNote)).delete(asyncHandler(deleteNote));

module.exports = router;