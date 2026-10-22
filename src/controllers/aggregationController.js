const mongoose = require('mongoose');
const User = require('../models/User');
const getPagination = require('../utils/pagination');

exports.groupUsersByInterests = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const result = await User.aggregate([
    { $unwind: '$interests' },
    {
      $group: {
        _id: '$interests',
        userCount: { $sum: 1 },
        users: { $push: { id: '$_id', name: '$name', email: '$email' } },
      },
    },
    { $sort: { userCount: -1, _id: 1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        meta: [{ $count: 'total' }],
      },
    },
  ]);

  const bucket = result[0] || { data: [], meta: [] };
  const total = bucket.meta[0]?.total || 0;

  res.json({ data: bucket.data, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 } });
};

exports.getUserPosts = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'Invalid user id' });
  const { page, limit, skip } = getPagination(req.query);

  const result = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'user',
        as: 'posts',
      },
    },
    {
      $project: {
        _id: 1, name: 1, email: 1,
        totalPosts: { $size: '$posts' },
        posts: {
          $slice: [
            { $sortArray: { input: '$posts', sortBy: { createdAt: -1 } } },
            skip, limit,
          ],
        },
      },
    },
  ]);

  const user = result[0];
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ data: user, pagination: { page, limit, total: user.totalPosts, pages: Math.ceil(user.totalPosts / limit) || 0 } });
};