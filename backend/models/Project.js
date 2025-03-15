const mongoose = require('mongoose');

/*
  References: User, Skill, Group, Course
  Referenced by: User, Group
*/
const projectSchema = new mongoose.Schema({
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
  clients: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
  },
  requiredSkills: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
  },
  groupsAssigned: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  maxGroups: {
    type: Number,
    required: true,
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

module.exports = mongoose.model('Project', projectSchema);
