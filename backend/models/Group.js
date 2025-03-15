const mongoose = require('mongoose');

/*
  References: User, Project, Course
  Referenced by: User, Project
*/
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    required: true,
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  projectAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  projectPreferences: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
});

module.exports = mongoose.model('Group', groupSchema);
