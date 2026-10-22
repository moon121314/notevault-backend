const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const agg = require('../controllers/aggregationController');

const router = express.Router();

router.get('/interests', protect, asyncHandler(agg.groupUsersByInterests));
router.get('/users/:userId/posts', protect, asyncHandler(agg.getUserPosts));

router.use(protect, adminOnly);

router.post('/users', asyncHandler(admin.addUser));
router.get('/users', asyncHandler(admin.listUsers));
router.put('/users/:id', asyncHandler(admin.updateUser));
router.delete('/users/:id', asyncHandler(admin.deleteUser));
router.get('/notes', asyncHandler(admin.listAllNotes));

module.exports = router;