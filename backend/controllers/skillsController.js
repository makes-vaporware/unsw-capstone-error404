const {
  studentSkillProfile,
} = require('../algos/group_recommending/student_scp');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc Get all skills
// @route GET /skills
// @access Private
const getAllSkills = async (req, res) => {
  const skills = await Skill.find().lean();
  if (!skills?.length) {
    return res.status(400).json({ message: 'No skills found' });
  }
  const sortedSkills = skills.sort((a, b) => a.name.localeCompare(b.name));
  res.json(sortedSkills);
};

// @desc Create new skill. Does not add the skill to the user.
// @route POST /skills
// @access Private
const createNewSkill = async (req, res) => {
  const { name, source, summary } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (name.includes('|')) {
    return res
      .status(400)
      .json({ message: 'Skill name cannot contain pipe character (|)' });
  }

  // Check for duplicate skills (name and source)
  const duplicate = await Skill.findOne({ name, source })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res
      .status(409)
      .json({ message: 'Skill with name and source already exists' });
  }

  const skillObject = {
    name,
    source,
    summary,
  };

  const skill = await Skill.create(skillObject);

  if (skill) {
    res.status(201).json({
      message: `New skill ${name} created`,
      skillId: skill._id,
    });
  } else {
    res.status(400).json({ message: 'Invalid skill data received' });
  }
};

// @desc Update a skill
// @route PATCH /skills
// @access Private
const updateSkill = async (req, res) => {
  const { skillId, name, source, summary } = req.body;
  const skill = await Skill.findById(skillId).exec();

  // TODO check you have privileges to change the skill
  if (name && name.includes('|')) {
    return res
      .status(400)
      .json({ message: 'Skill name cannot contain pipe character (|)' });
  }

  name ? (skill.name = name) : undefined;
  source ? (skill.source = source) : undefined;
  summary ? (skill.summary = summary) : undefined;

  const updatedSkill = await skill.save();

  res.json({
    message: `${updatedSkill.name} updated`,
  });
};

// @desc Delete a skill
// @route DELETE /skills
// @access Private
const deleteSkill = async (req, res) => {
  // TODO check privilege

  const { skillId } = req.body;
  const skill = await Skill.findById(skillId).exec();

  if (!skill) {
    return res.status(400).json({ message: 'Skill not found' });
  }

  // Drop references from other schemas
  await User.updateMany({}, { $pull: { skills: skillId } });
  await Project.updateMany({}, { $pull: { requiredSkills: skillId } });

  await Skill.deleteOne({ _id: skillId });

  res.json({ message: `${skill.name} deleted` });
};

// @desc Add skill to the user.
// @route POST /skills/add
// @access Private
const addSkillToUser = async (req, res) => {
  const { skillId } = req.body;
  const userId = req._id;
  const user = await User.findById(userId).exec();
  const skill = await Skill.findById(skillId).exec();

  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }

  if (!skill) {
    return res.status(400).json({ message: `Skill not found` });
  }

  if (user.skills.includes(skillId)) {
    return res.status(400).json({ message: `User already has the skill` });
  }

  await User.updateOne({ _id: userId }, { $addToSet: { skills: skillId } });

  await updateUserSCP(userId);

  return res.status(200).json({ message: `Skill added successfully.` });
};

// @desc Remove skill from the user.
// @route POST /skills/remove
// @access Private
const removeSkillFromUser = async (req, res) => {
  const { skillId } = req.body;
  const userId = req._id;
  const user = await User.findById(userId).exec();
  if (!user.skills.includes(skillId)) {
    return res
      .status(400)
      .json({ message: `User doesn't have the skill to delete` });
  }
  await User.updateOne({ _id: userId }, { $pull: { skills: skillId } });

  await updateUserSCP(userId);

  return res.status(200).json({ message: `Skill removed successfully.` });
};

// === Helper Functions ===
// Given userId, convert user's skills to a pipe-separated string.
const stringifyUserSkills = async (userId) => {
  const user = await User.findById(userId).exec();

  const skills = await Skill.find({ _id: { $in: user.skills } });
  const skillNames = skills.flatMap((skill) => skill.name);

  // join by pipe and return.
  return skillNames.join('|');
};

// Generates a skill profile for a user based on their skills.
const updateUserSCP = async (userId) => {
  const skillString = await stringifyUserSkills(userId);

  if (skillString === '') {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          skillCategoryProfile: {
            PM: 0,
            DE: 0,
            SD: 0,
            ML: 0,
            UX: 0,
            BA: 0,
          },
        },
      }
    );
  } else {
    const profile = await studentSkillProfile(skillString);

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          skillCategoryProfile: {
            PM: profile[0],
            DE: profile[1],
            SD: profile[2],
            ML: profile[3],
            UX: profile[4],
            BA: profile[5],
          },
        },
      }
    );
  }
};

module.exports = {
  getAllSkills,
  createNewSkill,
  updateSkill,
  deleteSkill,
  addSkillToUser,
  removeSkillFromUser,
};
