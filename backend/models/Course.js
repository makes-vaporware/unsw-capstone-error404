const mongoose = require('mongoose');

/*
  References: User
  Referenced by: User, Project, Group
*/
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  users: [
    {
      userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['student', 'academic', 'course-admin'],
      },
    },
  ],
  minGroupSize: {
    type: Number,
    required: true,
  },
  maxGroupSize: {
    type: Number,
    required: true,
  },
  studentJoinCode: {
    type: String,
    required: true,
    default: '1',
  },
  academicJoinCode: {
    type: String,
    required: true,
    default: '2',
  },
  adminJoinCode: {
    type: String,
    required: true,
    default: '3',
  },
});

module.exports = mongoose.model('Course', courseSchema);
