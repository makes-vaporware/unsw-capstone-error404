const mongoose = require('mongoose');

/*
  References: Course, Project, Group, Skill
  Referenced by: Course, Group, Project
*/
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  university: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isSiteAdmin: { type: Boolean, default: false },
  courses: [
    {
      courseid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      role: {
        type: String,
        enum: ['student', 'academic', 'course-admin'],
        default: 'student',
      },
    },
  ],
  projectsOwned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  groupsJoined: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
  ],
  skills: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Skill',
  },
  skillCategoryProfile: {
    PM: {
      type: Number,
      default: 0,
    },
    DE: {
      type: Number,
      default: 0,
    },
    SD: {
      type: Number,
      default: 0,
    },
    ML: {
      type: Number,
      default: 0,
    },
    UX: {
      type: Number,
      default: 0,
    },
    BA: {
      type: Number,
      default: 0,
    },
  },
});

module.exports = mongoose.model('User', userSchema);
