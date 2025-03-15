const mongoose = require('mongoose');

/*
  References: N/A
  Referenced by: User, Project
*/
const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: 'user entry',
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Skill', skillSchema);
