const {
  projectSkillProfile,
} = require('../algos/group_recommending/project_scp');
const { pcomp } = require('../algos/project_matching/pcomp');
const Course = require('../models/Course');
const Group = require('../models/Group');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const User = require('../models/User');

// @desc Get all projects
// @route GET /projects
// @access Private
const getAllProjects = async (req, res) => {
  const projects = await Project.find().lean();
  res.json(projects);
};

// @desc Create new project
// @route POST /projects
// @access Private
const createNewProject = async (req, res) => {
  const {
    name,
    subtitle,
    description,
    clientId,
    courseId,
    category,
    maxGroups,
  } = req.body;
  const newClient = await User.findById(clientId).exec();
  const course = await Course.findById(courseId).exec();
  const sender = await User.findById(req._id).exec();

  if (
    !name ||
    !subtitle ||
    !description ||
    !clientId ||
    !courseId ||
    !category ||
    !maxGroups
  ) {
    return res.status(400).json({
      message:
        'Missing one of these fields: name, description, clientId, courseId, category, maxGroups',
    });
  }

  // Check if sender can create projects.
  if (
    !sender.isSiteAdmin &&
    sender.courses.some(
      (c) => c.courseid.toString() === courseId && c.role === 'student'
    )
  ) {
    return res.status(403).json({
      message:
        'User does not have permissions to create a project in this course.',
    });
  }

  // Client must exist and can be a client (is not a student)
  if (!newClient) {
    return res.status(400).json({ message: 'Intended client not found' });
  } else if (
    newClient.courses.some(
      (c) => c.courseid.toString() === courseId && c.role === 'student'
    )
  ) {
    return res
      .status(403)
      .json({ message: 'User cannot create projects in this course' });
  }

  if (!course) {
    return res.status(400).json({ message: 'Associated course not found' });
  }

  const projectObject = {
    name,
    subtitle,
    description,
    clients: [clientId],
    requiredSkills: [],
    groupsAssigned: [],
    courseId,
    category,
    maxGroups,
  };

  const project = await Project.create(projectObject);

  await User.updateOne(
    { _id: clientId },
    { $addToSet: { projectsOwned: project._id } }
  );
  if (project) {
    res
      .status(201)
      .json({ message: `New project ${name} created`, projectId: project._id });
  } else {
    res.status(400).json({ message: 'Invalid project data received' });
  }
};

// @desc Update a project's details (sans groupsAssigned)
// @route PATCH /projects
// @access Private
const updateProject = async (req, res) => {
  const { projectId, name, subtitle, description, category, maxGroups } =
    req.body;
  const sender = await User.findById(req._id).exec();
  const project = await Project.findById(projectId).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  }

  // Check permissions for this action
  if (!userCanManageProject(sender, project)) {
    return res.status(403).json({
      message: 'User does not have permissions to update project details.',
      projectId: project._id,
      senderId: req._id,
    });
  }

  name ? (project.name = name) : undefined;
  subtitle ? (project.subtitle = subtitle) : undefined;
  description ? (project.description = description) : undefined;
  category ? (project.category = category) : undefined;
  maxGroups ? (project.maxGroups = maxGroups) : undefined;

  const updatedProject = await project.save();

  res.json({
    message: `Project ${projectId}: ${updatedProject.name} updated`,
  });
};

// @desc Delete a project
// @route DELETE /projects
// @access Private
const deleteProject = async (req, res) => {
  const { projectId } = req.body;
  const project = await Project.findById(projectId).exec();
  const sender = await User.findById(req._id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  }

  // Check permissions for this action
  if (!userCanManageProject(sender, project)) {
    return res.status(403).json({
      message: 'User does not have permissions to update project details.',
      projectId: project._id,
      senderId: req._id,
    });
  }

  // Drop references from other schemas
  await User.updateMany({}, { $pull: { projectsOwned: projectId } });

  await Group.updateMany(
    { projectAssigned: projectId },
    { $set: { projectAssigned: null } }
  );

  await Group.updateMany({}, { $pull: { projectPreferences: projectId } });

  await project.deleteOne();

  res.json(`Project ${projectId}: ${project.name} deleted`);
};

// @desc Active user leaves the project's client list
// @route POST /projects/leave
// @access Private
const leaveProject = async (req, res) => {
  const { projectId } = req.body;
  const project = await Project.findById(projectId).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  }

  // Specific to leaving: ensure not last client
  if (project.clients.length === 1) {
    return res.status(403).json({
      message: 'User is the last client. Delete the project instead.',
    });
  }

  await User.updateOne(
    { _id: req._id },
    { $pull: { projectsOwned: projectId } }
  );

  await Project.updateOne({ _id: projectId }, { $pull: { clients: req._id } });

  res.json({ message: `Left ${project.name}` });
};

// @desc Add a client to the project
// @route POST /projects/addclient
// @access Private
const addClientToProject = async (req, res) => {
  const { projectId, clientId } = req.body;
  const project = await Project.findById(projectId).exec();
  const client = await User.findById(clientId).exec();
  const sender = await User.findById(req._id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  } else if (!client) {
    return res.status(400).json({ message: 'Client not found' });
  }

  if (!userCanManageProject(sender, project)) {
    return res.status(403).json({
      message: 'This user does not have permissions to manage the project.',
    });
  }

  if (!userCanBeClient(client, project)) {
    return res
      .status(403)
      .json({ message: "User cannot be a client in this course's projects" });
  }

  await User.updateOne(
    { _id: clientId },
    { $addToSet: { projectsOwned: projectId } }
  );

  await Project.updateOne(
    { _id: projectId },
    { $addToSet: { clients: clientId } }
  );

  res.json({ message: `Added ${client.name} to the project's clients.` });
};

// @desc Remove a client from the project
// @route POST /projects/removeclient
// @access Private
const removeClientFromProject = async (req, res) => {
  const { projectId, clientId } = req.body;
  const project = await Project.findById(projectId).exec();
  const client = await User.findById(clientId).exec();
  const sender = await User.findById(req._id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  } else if (!client) {
    return res.status(400).json({ message: 'Client not found' });
  }

  if (!userCanManageProject(sender, project)) {
    return res.status(403).json({
      message: 'This user does not have permissions to manage the project.',
    });
  }

  // Specific to leaving: ensure not last client
  if (project.clients.length === 1) {
    return res.status(403).json({
      message: "User is the last client. Can't remove user from project.",
    });
  }

  await User.updateOne(
    { _id: clientId },
    { $pull: { projectsOwned: projectId } }
  );

  await Project.updateOne({ _id: projectId }, { $pull: { clients: clientId } });

  res.json({ message: `Removed ${client.name} from the project's clients.` });
};

// @desc Add a skill to the project
// @route POST /projects/addskill
// @access Private
const addSkillToProject = async (req, res) => {
  const { projectId, skillId } = req.body;
  const project = await Project.findById(projectId).exec();
  const skill = await Skill.findById(skillId).exec();
  const sender = await User.findById(req._id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  } else if (!skill) {
    return res.status(400).json({ message: 'Skill not found' });
  }

  if (!userCanManageProject(sender, project)) {
    return res.status(403).json({
      message: 'This user does not have permissions to manage the project.',
    });
  }

  await Project.updateOne(
    { _id: projectId },
    { $addToSet: { requiredSkills: skillId } }
  );
  await updateProjectSCP(projectId);

  res.json({ message: `Added ${skill.name} to the project's skills.` });
};

// @desc Remove a client from project's clients
// @route POST /projects/removeskill
// @access Private
const removeSkillFromProject = async (req, res) => {
  const { projectId, skillId } = req.body;
  const project = await Project.findById(projectId).exec();
  const skill = await Skill.findById(skillId).exec();
  const sender = await User.findById(req._id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  } else if (!skill) {
    return res.status(400).json({ message: 'Skill not found' });
  }

  if (!userCanManageProject(sender, project)) {
    return res.status(403).json({
      message: 'This user does not have permissions to manage the project.',
    });
  }

  await Project.updateOne(
    { _id: projectId },
    { $pull: { requiredSkills: skillId } }
  );
  await updateProjectSCP(projectId);

  res.json({ message: `Removed ${skill.name} from the project's skills.` });
};

// @desc Assign a group to this project
// @route POST /projects/assigngroup
// @access Private
const assignGroupToProject = async (req, res) => {
  const { projectId, groupId } = req.body;
  const project = await Project.findById(projectId).exec();
  const group = await Group.findById(groupId).exec();
  const sender = await User.findById(req._id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  } else if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  if (!userCanManageProject(sender, project)) {
    return res.status(403).json({
      message: 'User does not have permissions to update project details.',
      projectId: project._id,
      senderId: req._id,
    });
  }

  // Update schemas
  await Project.updateOne(
    { _id: projectId },
    { $addToSet: { groupsAssigned: groupId } }
  );

  await Group.updateOne(
    { _id: groupId },
    { $set: { projectAssigned: projectId } }
  );

  res.json(`Group ${group.name} assigned to project ${project.name}`);
};

// @desc Remove a group from this project
// @route POST /projects/removegroup
// @access Private
const removeGroupFromProject = async (req, res) => {
  const { projectId, groupId } = req.body;
  const project = await Project.findById(projectId).exec();
  const group = await Group.findById(groupId).exec();
  const sender = await User.findById(req._id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  } else if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  if (!userCanManageProject(sender, project)) {
    return res.status(403).json({
      message: 'User does not have permissions to update project details.',
      projectId: project._id,
      senderId: req._id,
    });
  }

  // Update schemas
  await Project.updateOne(
    { _id: projectId },
    { $pull: { groupsAssigned: groupId } }
  );

  await Group.updateOne({ _id: groupId }, { $set: { projectAssigned: null } });

  res.json(`Group ${group.name} unassigned from project ${project.name}`);
};

// @desc Add this project to a group's preferences
// @route POST /projects/addpreferences
// @access Private
const addProjectToGroupPreferences = async (req, res) => {
  const { projectId, groupId } = req.body;
  const project = await Project.findById(projectId).exec();
  const group = await Group.findById(groupId).exec();
  const sender = await User.findById(req._id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  } else if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  // User should be a part of the group to do this
  if (!group.members.includes(sender._id)) {
    return res.status(403).json({
      message:
        'User does not have permissions to adjust preferences for this group.',
      projectId: project._id,
      senderId: req._id,
    });
  }

  // Update schemas
  await Group.updateOne(
    { _id: groupId },
    { $addToSet: { projectPreferences: projectId } }
  );

  res.json(
    `Group ${group.name} nominated preference for project ${project.name}`
  );
};

// @desc Remove this project from a group's preferences
// @route POST /projects/removepreferences
// @access Private
const removeProjectFromGroupPreferences = async (req, res) => {
  const { projectId, groupId } = req.body;
  const project = await Project.findById(projectId).exec();
  const group = await Group.findById(groupId).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  } else if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  // User should be a part of the group to do this
  if (!group.members.includes(req._id)) {
    return res.status(403).json({
      message:
        'User does not have permissions to adjust preferences for this group.',
      projectId: project._id,
      senderId: req._id,
    });
  }

  // Update schemas
  await Group.updateOne(
    { _id: groupId },
    { $pull: { projectPreferences: projectId } }
  );

  res.json(
    `Group ${group.name} removed preference for project ${project.name}`
  );
};

// @desc Recommend projects to group, with descending compatibility
// @route GET /projects/recommend
// @access Private
const recommendProjects = async (req, res) => {
  const { groupId } = req.query;
  const group = await Group.findById(groupId).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  const availableProjects = await Project.find({
    courseId: group.courseId,
  }).exec();

  const totalGroupSCP = await calcGroupSCP(groupId);
  const averageGroupSCP = totalGroupSCP.map((x) => x / group.members.length);
  let totalScore = 0;

  // Compare it to each project's scp
  const projectCalcs = availableProjects.map((project) => {
    const project_scp = [
      project.skillCategoryProfile.PM,
      project.skillCategoryProfile.DE,
      project.skillCategoryProfile.SD,
      project.skillCategoryProfile.ML,
      project.skillCategoryProfile.UX,
      project.skillCategoryProfile.BA,
    ];
    const score = pcomp(false, averageGroupSCP, project_scp);

    totalScore += score;
    return [project._id, score];
  });

  // Sort by decreasing and return this: [{projectId, score}]
  const results = projectCalcs.map(([id, x]) => {
    return {
      projectId: id.toString(),
      score: (100 * (x / totalScore)).toFixed(1),
    };
  });
  results.sort((a, b) => b.score - a.score);

  if (results.length === 1) {
    results[0].score = '100.0';
  }

  res.json(results);
};

// Helper functions
// Return true if user is a project client, a course admin, or a site admin.
const userCanManageProject = (user, project) => {
  return (
    user.isSiteAdmin ||
    project.clients.includes(user._id) ||
    user.courses.some(
      (c) => c.courseid.equals(project.courseId) && c.role === 'course-admin'
    )
  );
};

// Return true if user is not a student in the group's course.
const userCanBeClient = (user, project) => {
  return !user.courses.some(
    (c) => c.courseid.equals(project.courseId) && c.role === 'student'
  );
};

// Given projectId, convert project's skills to a pipe-separated string.
const stringifyProjectSkills = async (projectId) => {
  const project = await Project.findById(projectId).exec();

  const skills = await Skill.find({ _id: { $in: project.requiredSkills } });
  const skillNames = skills.flatMap((skill) => skill.name);

  return skillNames.join('|');
};

// Generates a skill profile for a project based on their skills.
const updateProjectSCP = async (projectId) => {
  // Convert a project's skills into a string of skills
  let skillString = await stringifyProjectSkills(projectId);

  if (skillString === '') {
    await Project.updateOne(
      { _id: projectId },
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
    const profile = await projectSkillProfile(skillString);

    await Project.updateOne(
      { _id: projectId },
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

// Generates the SCP for a group based off its members.
const calcGroupSCP = async (groupId) => {
  const group = await Group.findById(groupId).exec();
  const members = await User.find({ _id: { $in: group.members } });

  const groupSCP = {
    PM: 0,
    DE: 0,
    SD: 0,
    ML: 0,
    UX: 0,
    BA: 0,
  };

  // sum up member SCPs
  for (const member of members) {
    const userSCP = member.skillCategoryProfile;
    for (let key in groupSCP) {
      groupSCP[key] += userSCP[key];
    }
  }

  return [
    groupSCP.PM,
    groupSCP.DE,
    groupSCP.SD,
    groupSCP.ML,
    groupSCP.UX,
    groupSCP.BA,
  ];
};

module.exports = {
  getAllProjects,
  createNewProject,
  updateProject,
  deleteProject,
  leaveProject,
  addClientToProject,
  removeClientFromProject,
  addSkillToProject,
  removeSkillFromProject,
  assignGroupToProject,
  removeGroupFromProject,
  addProjectToGroupPreferences,
  removeProjectFromGroupPreferences,
  recommendProjects,
};
