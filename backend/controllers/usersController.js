const Course = require('../models/Course');
const Group = require('../models/Group');
const Project = require('../models/Project');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').lean();

  if (!users?.length) {
    return res.status(400).json({ message: 'No users found' });
  }

  res.json(users);
};

// @desc Get a single user's profile
// @route GET /users/profile
// @access Private
const getUserProfile = async (req, res) => {
  const { userId } = req.query;
  const user = await User.findById(userId).select('-password -__v').exec();

  if (!userId) {
    return res.status(400).json({ message: 'userId required' });
  }

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  res.json(user);
};

// @desc Update a user's details
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
  const { userId, email, name, university, password } = req.body;
  const user = await User.findById(userId).exec();
  const sender = await User.findById(req._id).exec();

  if (!userId) {
    return res.status(400).json({ message: 'userId required' });
  }

  // check permissions for sender
  if (!sender.equals(user) && !sender.isSiteAdmin) {
    return res.status(403).json({ message: 'User cannot modify this profile' });
  }

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  name ? (user.name = name) : undefined;
  university ? (user.university = university) : undefined;
  password ? (user.password = await bcrypt.hash(password, 10)) : undefined;

  if (email) {
    // Check for duplicate email
    // collation checks for case insensitivity.
    const duplicate = await User.findOne({ email })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

    // Allow updates only to the original user
    if (duplicate && duplicate?._id?.toString() !== user._id.toString()) {
      return res.status(409).json({ message: 'Duplicate email' });
    }

    user.email = email;
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.name} updated` });
};

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId).exec();
  const sender = await User.findById(req._id).exec();

  if (!userId) {
    return res.status(400).json({ message: 'userId required' });
  }

  // check permissions for sender
  if (!sender.equals(user) && !sender.isSiteAdmin) {
    return res.status(403).json({ message: 'User cannot delete this profile' });
  }

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Drop all references from other schemas
  // Ownerless groups and clientless projects remain, and must be manually addressed by course admins.

  await Course.updateMany({}, { $pull: { users: { userid: userId } } });

  await Group.updateMany({}, { $pull: { members: userId } });

  await Project.updateMany({}, { $pull: { clients: userId } });

  await user.deleteOne();

  res.json(`User ${user.name} deleted`);
};

// @desc Get a user's skill category profile
// @route GET /users/scp
// @access Private
const getUserSCP = async (req, res) => {
  const { userId } = req.query;
  const user = await User.findById(userId).exec();

  if (!userId) {
    return res.status(400).json({ message: 'userId required' });
  }

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  res.json(user.skillCategoryProfile);
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUser,
  deleteUser,
  getUserSCP,
};
