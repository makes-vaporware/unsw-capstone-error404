const Group = require('../models/Group');
const User = require('../models/User');
const Project = require('../models/Project');
const Course = require('../models/Course');
const { gcomp } = require('../algos/group_recommending/gcomp.js');
const { mongoose } = require('mongoose');
const { pcomp } = require('../algos/project_matching/pcomp.js');
const { optimalMapping } = require('../algos/project_matching/hungarian.js');

// @desc Get all groups
// @route GET /groups
// @access Private
const getAllGroups = async (req, res) => {
  const groups = await Group.find().lean();

  if (!groups?.length) {
    return res.status(400).json({ message: 'No groups found' });
  }

  res.json(groups);
};

// @desc Create new group
// @route POST /groups
// @access Private
const createNewGroup = async (req, res) => {
  const { name, description, isPrivate, ownerId, courseId } = req.body;
  const newOwner = await User.findById(ownerId).exec();
  const course = await Course.findById(courseId).exec();
  const sender = await User.findById(req._id).exec();

  if (
    !name ||
    !description ||
    isPrivate === undefined ||
    !ownerId ||
    courseId === undefined
  ) {
    return res.status(400).json({
      message:
        'name, description, isPrivate, ownerId and courseId are required',
    });
  }

  // Check that sender can create group. cannot if is academic
  if (
    !sender.isSiteAdmin &&
    sender.courses.some(
      (c) => c.courseid.toString() === courseId && c.role === 'academic'
    )
  ) {
    return res.status(403).json({
      message:
        'User does not have permissions to create a group in this course.',
    });
  }

  // Owner must exist and can join groups (is a student)
  if (!newOwner) {
    return res.status(400).json({ message: 'Intended owner not found' });
  } else if (
    !newOwner.courses.some(
      (c) => c.courseid.toString() === courseId && c.role === 'student'
    )
  ) {
    return res
      .status(403)
      .json({ message: 'User is not a student in this course' });
  }

  if (!course) {
    return res.status(400).json({ message: 'Associated course not found' });
  }

  const groupObject = {
    name,
    description,
    isPrivate,
    members: [ownerId],
    owner: ownerId,
    projectAssigned: null,
    projectPreferences: [],
    courseId,
  };

  const group = await Group.create(groupObject);

  if (group) {
    res
      .status(201)
      .json({ message: `New group ${name} created`, groupId: group._id });
  } else {
    res.status(400).json({ message: 'Invalid group data received' });
  }

  await User.updateOne(
    { _id: ownerId },
    { $addToSet: { groupsJoined: group._id } }
  );
};

// @desc Update a group's details (only name, description, isPrivate)
// @route PATCH /groups
// @access Private
const updateGroup = async (req, res) => {
  const { groupId, name, description, isPrivate } = req.body;
  const group = await Group.findById(groupId).exec();
  const sender = await User.findById(req._id).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  if (!userCanManageGroup(sender, group)) {
    return res.status(403).json({
      message: 'User does not have permissions to update group details.',
      groupId: group._id,
      senderId: req._id,
    });
  }

  name ? (group.name = name) : undefined;
  description ? (group.description = description) : undefined;
  isPrivate !== undefined ? (group.isPrivate = isPrivate) : undefined;

  const updatedGroup = await group.save();

  res.json({
    message: `Group ${groupId}: ${updatedGroup.name} updated`,
  });
};

// @desc Delete a group
// @route DELETE /groups
// @access Private
const deleteGroup = async (req, res) => {
  const { groupId } = req.body;
  const group = await Group.findById(groupId).exec();
  const sender = await User.findById(req._id).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  // check perms for this action
  if (!userCanManageGroup(sender, group)) {
    return res.status(403).json({
      message: 'This user does not have permissions to delete group.',
      groupId: group._id,
      senderId: req._id,
    });
  }

  // Drop references from other schemas
  await User.updateMany({}, { $pull: { groupsJoined: groupId } });

  await Project.updateMany({}, { $pull: { groupsAssigned: groupId } });

  await group.deleteOne();

  res.json(`Group ${groupId}: ${group.name} deleted`);
};

// @desc Active user joins a group
// @route POST /groups/join
// @access Private
const joinGroup = async (req, res) => {
  const { groupId } = req.body;
  const group = await Group.findById(groupId).exec();
  const sender = await User.findById(req._id).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  if (group.isPrivate) {
    return res.status(403).json({ message: 'Group is set to private' });
  }

  if (!userCanJoinGroup(sender, group)) {
    return res
      .status(403)
      .json({ message: 'User is not a student in this course' });
  }

  await User.updateOne(
    { _id: req._id },
    { $addToSet: { groupsJoined: groupId } }
  );

  await Group.updateOne({ _id: groupId }, { $addToSet: { members: req._id } });

  res.json({ message: `Joined ${group.name}` });
};

// @desc Active user leaves a group
// @route POST /groups/leave
// @access Private
const leaveGroup = async (req, res) => {
  const { groupId } = req.body;
  const group = await Group.findById(groupId).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  // Specific to leaving: ensure not group owner
  if (group.owner.toString() === req._id) {
    return res.status(403).json({
      message:
        'User is the group owner. Transfer ownership first, or delete the group instead.',
    });
  }

  await User.updateOne({ _id: req._id }, { $pull: { groupsJoined: groupId } });

  await Group.updateOne({ _id: groupId }, { $pull: { members: req._id } });

  res.json({ message: `Left ${group.name}` });
};

// @desc Add a user to the group
// @route POST /groups/adduser
// @access Private
const addUserToGroup = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await Group.findById(groupId).exec();
  const user = await User.findById(userId).exec();
  const sender = await User.findById(req._id).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  } else if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  if (!userCanManageGroup(sender, group)) {
    return res.status(403).json({
      message: 'This user does not have permissions to manage the group.',
    });
  }

  if (!userCanJoinGroup(user, group)) {
    return res
      .status(403)
      .json({ message: "User is not a student in this group's course" });
  }

  await User.updateOne(
    { _id: userId },
    { $addToSet: { groupsJoined: groupId } }
  );

  await Group.updateOne({ _id: groupId }, { $addToSet: { members: userId } });

  res.json({ message: `Added ${user.name} to the group.` });
};

// @desc Remove a user from the group
// @route POST /groups/removeuser
// @access Private
const removeUserFromGroup = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await Group.findById(groupId).exec();
  const user = await User.findById(userId).exec();
  const sender = await User.findById(req._id).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  } else if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  if (!userCanManageGroup(sender, group)) {
    return res.status(403).json({
      message: 'This user does not have permissions to manage the group.',
    });
  }

  // Specific to leaving: ensure not group owner
  if (group.owner.equals(user)) {
    return res.status(403).json({
      message: 'User is the group owner. Cannot be removed from group.',
    });
  }

  await User.updateOne({ _id: userId }, { $pull: { groupsJoined: groupId } });

  await Group.updateOne({ _id: groupId }, { $pull: { members: userId } });

  res.json({ message: `Removed ${user.name} from the group.` });
};

// @desc Change group owner
// @route POST /groups/changeowner
// @access Private
const changeGroupOwner = async (req, res) => {
  const { groupId, newOwnerId } = req.body;
  const group = await Group.findById(groupId).exec();
  const newOwner = await User.findById(newOwnerId).exec();
  const sender = await User.findById(req._id).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  } else if (!newOwner) {
    return res.status(400).json({ message: 'New owner not found' });
  }

  if (!userCanManageGroup(sender, group)) {
    return res.status(403).json({
      message: 'This user does not have permissions to manage the group.',
    });
  }

  if (!group.members.includes(newOwnerId)) {
    return res.status(400).json({ message: 'New owner is not in the group.' });
  }

  group.owner = newOwnerId;
  await group.save();

  res.json({ message: `Changed owner of ${group.name} to ${newOwner.name}` });
};

// @desc Recommend groups to user, with descending compatibility
// @route GET /groups/recommend
// @access Private
const recommendGroups = async (req, res) => {
  const { courseId } = req.query;
  const user = await User.findById(req._id).exec();
  const course = await Course.findById(courseId).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  } else if (!course) {
    return res.status(400).json({ message: 'Course not found' });
  }

  const availableGroups = await Group.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
    { $addFields: { membersCount: { $size: '$members' } } },
    { $match: { membersCount: { $lt: course.maxGroupSize } } },
  ]).exec();

  const student_scp = [
    user.skillCategoryProfile.PM,
    user.skillCategoryProfile.DE,
    user.skillCategoryProfile.SD,
    user.skillCategoryProfile.ML,
    user.skillCategoryProfile.UX,
    user.skillCategoryProfile.BA,
  ];

  let totalIncompatibility = 0;

  const groupCalcs = await Promise.all(
    availableGroups.map(async (group) => {
      const [group_scp, goal_scp] = await Promise.all([
        calcGroupSCP(group._id),
        calcGoalSCP(group._id),
      ]);
      totalIncompatibility += gcomp(student_scp, group_scp, goal_scp);
      return [group._id, gcomp(student_scp, group_scp, goal_scp)];
    })
  );

  // Sort the results by decreasing compatibility percentage.
  // Return objects with IDs and scores.
  const results = groupCalcs.map(([id, x]) => {
    return {
      groupId: id.toString(),
      score: (100 * (1 - x / totalIncompatibility)).toFixed(1),
    };
  });
  results.sort((a, b) => b.score - a.score);

  if (results.length === 1) {
    results[0].score = '100.0';
  }

  res.json(results);
};

// @desc Get a group's average member SCP
// @route GET /groups/scp
// @access Private
const getAverageGroupSCP = async (req, res) => {
  const { groupId } = req.query;
  const group = await Group.findById(groupId).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  const membersCount = group.members.length;
  const averageMemberSCP = (await calcGroupSCP(groupId)).map((x) =>
    (x / membersCount).toFixed(1)
  );

  const groupSCP = {
    PM: averageMemberSCP[0],
    DE: averageMemberSCP[1],
    SD: averageMemberSCP[2],
    ML: averageMemberSCP[3],
    UX: averageMemberSCP[4],
    BA: averageMemberSCP[5],
  };

  res.json(groupSCP);
};

// @desc Get a group's total member SCP
// @route GET /groups/scptotal
// @access Private
const getTotalGroupSCP = async (req, res) => {
  const { groupId } = req.query;
  const group = await Group.findById(groupId).exec();

  if (!group) {
    return res.status(400).json({ message: 'Group not found' });
  }

  const totalGroupSCP = await calcGroupSCP(groupId);

  const groupSCP = {
    PM: totalGroupSCP[0],
    DE: totalGroupSCP[1],
    SD: totalGroupSCP[2],
    ML: totalGroupSCP[3],
    UX: totalGroupSCP[4],
    BA: totalGroupSCP[5],
  };

  res.json(groupSCP);
};

// @desc Recommend projects to group, with descending compatibility
// @route GET /groups/match/suggest
// @access Private
const groupsMatchSuggest = async (req, res) => {
  const { courseId } = req.query;
  const course = await Course.findById(courseId).exec();

  if (!course) {
    return res.status(400).json({ message: 'Course not found' });
  }

  const availableGroups = await Group.find({ courseId: courseId }).exec();
  const availableProjects = await Project.find({ courseId: courseId }).exec();

  // If there are no groups, exit early.
  if (availableGroups.length === 0) {
    return res.json({});
  }

  // Check that there are enough project slots for groups.
  const maxProjects = availableProjects.reduce(
    (accumulator, p) => accumulator + p.maxGroups,
    0
  );

  if (maxProjects < availableGroups.length) {
    return res.status(422).json({
      message: `Not enough projects for groups! Please discuss with project clients and adjust max group sizes. (Groups: ${availableGroups.length}, Project slots: ${maxProjects})`,
    });
  }

  // Create own shorthand info
  const projectsInfo = availableProjects.map((p) => {
    return {
      projectId: p._id,
      project_scp: [
        p.skillCategoryProfile.PM,
        p.skillCategoryProfile.DE,
        p.skillCategoryProfile.SD,
        p.skillCategoryProfile.ML,
        p.skillCategoryProfile.UX,
        p.skillCategoryProfile.BA,
      ],
      maxSlots: p.maxGroups,
      actualSlots: 1,
    };
  });

  // Assign project slots in round-robin fashion.
  // If there are more groups than unique projects,
  // this ensures that all projects are assigned at least one group.
  let slots = projectsInfo.length;

  while (slots < availableGroups.length) {
    for (const p of projectsInfo) {
      if (p.actualSlots < p.maxSlots) {
        p.actualSlots++;
        slots++;
      }
    }
  }

  // Duplicate project slots according to number of slots determined earlier
  const expandedProjects = projectsInfo.flatMap((p) => {
    return Array.from({ length: p.actualSlots }, () => ({
      projectId: p.projectId,
      project_scp: p.project_scp,
    }));
  });

  // Creation of compatibility matrix for hungarian algorithm
  const compatibilityMatrix = [];

  for (const group of availableGroups) {
    const group_scp = await calcGroupSCP(group._id);
    const pcomp_arr = [];
    for (const project of expandedProjects) {
      const isLiked = group.projectPreferences.includes(project._id);
      const score = pcomp(isLiked, group_scp, project.project_scp);
      pcomp_arr.push(score);
    }
    compatibilityMatrix.push(pcomp_arr);
  }

  // Run hungarian algorithm
  const hungarian = optimalMapping(compatibilityMatrix);

  // Sort by decreasing and return this: [{groupId, projectId, score}]
  const matches = hungarian.map((g, index) => {
    const groupId = availableGroups[index]._id;
    const matchedProject = g.findIndex((x) => x === 1);
    const projectId = expandedProjects[matchedProject].projectId;
    const score = compatibilityMatrix[index][matchedProject];
    return { groupId, projectId, score };
  });

  const results = matches.map((m) => {
    return {
      groupId: m.groupId.toString(),
      projectId: m.projectId.toString(),
      score: m.score,
    };
  });
  results.sort((a, b) => b.score - a.score);

  res.json(results);
};

// @desc Recommend projects to group, with descending compatibility
// @route PUT /groups/match/assign
// @access Private
const groupsMatchAssign = async (req, res) => {
  const { matches } = req.body;

  if (!matches) {
    return res.status(400).json({ message: 'matches parameter not given' });
  }

  // clear all assigned groups
  await Project.updateMany({}, { $set: { groupsAssigned: [] } });

  const promises = matches.map(async (m) => {
    const [projectId, groupId] = [m.projectId, m.groupId];
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
  });

  await Promise.all(promises);

  res.json({ message: 'Succeeded in assigning groups to projects!' });
};

// @desc Remove all assignments on all groups in a course.
// @route PATCH /groups/clearprojectassignments
// @access Private
const groupsClearAssignments = async (req, res) => {
  const { courseId } = req.body;

  await Group.updateMany(
    { courseId: courseId },
    { $unset: { projectAssigned: 1 } }
  );
  await Project.updateMany({ courseId: courseId }, { groupsAssigned: [] });

  res.json({ message: 'Group preferences cleared.' });
};

// === Helper functions ===
// Rreturn true if user is the group owner, a course admin, or a site admin.
const userCanManageGroup = (user, group) => {
  return (
    user.isSiteAdmin ||
    group.owner.equals(user._id) ||
    user.courses.some(
      (c) => c.courseid.equals(group.courseId) && c.role === 'course-admin'
    )
  );
};

// Return true if user is a student in the group's course.
const userCanJoinGroup = (user, group) => {
  return user.courses.some(
    (c) => c.courseid.equals(group.courseId) && c.role === 'student'
  );
};

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

  // Sum up member SCPs
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

// Generates a goal SCP based off a group's liked projects.
const calcGoalSCP = async (groupId) => {
  const group = await Group.findById(groupId).exec();
  const likedProjects = await Project.find({
    _id: { $in: group.projectPreferences },
  });

  const goalSCP = {
    PM: 0,
    DE: 0,
    SD: 0,
    ML: 0,
    UX: 0,
    BA: 0,
  };

  // if >= 3 liked projects, take average of the liked projects.
  // if less than 3 liked projects, average all project_scps in the course

  if (likedProjects.length >= 3) {
    for (const project of likedProjects) {
      const projectSCP = project.skillCategoryProfile;
      for (let key in goalSCP) {
        goalSCP[key] += projectSCP[key];
      }
    }
    for (let key in goalSCP) {
      goalSCP[key] /= likedProjects.length;
    }
  } else {
    let courseProjects = await Project.find({
      courseId: group.courseId,
    }).exec();
    for (const project of courseProjects) {
      const projectSCP = project.skillCategoryProfile;
      for (let key in goalSCP) {
        goalSCP[key] += projectSCP[key];
      }
    }
    for (let key in goalSCP) {
      goalSCP[key] /= courseProjects.length;
    }
  }

  return [
    goalSCP.PM,
    goalSCP.DE,
    goalSCP.SD,
    goalSCP.ML,
    goalSCP.UX,
    goalSCP.BA,
  ];
};

module.exports = {
  getAllGroups,
  createNewGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  addUserToGroup,
  removeUserFromGroup,
  changeGroupOwner,
  recommendGroups,
  getAverageGroupSCP,
  getTotalGroupSCP,
  groupsMatchSuggest,
  groupsMatchAssign,
  groupsClearAssignments,
};
