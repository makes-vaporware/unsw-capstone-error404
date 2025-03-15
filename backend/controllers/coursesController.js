const Course = require('../models/Course');
const Group = require('../models/Group');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc Get all courses
// @route GET /courses
// @access Private
const getAllCourses = async (req, res) => {
  const courses = await Course.find().lean();
  res.json(courses);
};

// @desc Create new course
// @route POST /courses
// @access Public
const createNewCourse = async (req, res) => {
  const {
    name,
    subtitle,
    description,
    courseCode,
    minGroupSize = 2,
    maxGroupSize = 5,
  } = req.body;
  const userid = req._id;

  if (!name || !courseCode) {
    return res
      .status(400)
      .json({ message: 'Name and Course Code are required' });
  }

  // Check for duplicate courses
  const duplicate = await Course.findOne({ courseCode })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res
      .status(409)
      .json({ message: 'Course with course code already exists' });
  }

  const courseObject = {
    name,
    subtitle,
    description,
    courseCode,
    users: [
      {
        userid: userid,
        role: 'course-admin',
      },
    ],
    minGroupSize,
    maxGroupSize,
  };

  const course = await Course.create(courseObject);

  await setRoleInUser(userid, course._id, 'course-admin');

  if (course) {
    res.status(201).json({
      message: `New course ${courseCode} created`,
      courseId: course._id,
    });
  } else {
    res.status(400).json({ message: 'Invalid course data received' });
  }
};

// @desc Update a course
// @route PATCH /courses
// @access Private
const updateCourse = async (req, res) => {
  const {
    courseId,
    name,
    courseCode,
    subtitle,
    description,
    minGroupSize,
    maxGroupSize,
    studentJoinCode,
    academicJoinCode,
    adminJoinCode,
  } = req.body;
  const course = await Course.findById(courseId).exec();

  const privileged = await isAdmin(course, req._id);
  if (!privileged) {
    return res.status(403).json({
      message: 'Not an admin of the course to update.',
      users: course.users,
      senderid: req._id,
    });
  }

  name ? (course.name = name) : undefined;
  courseCode ? (course.courseCode = courseCode) : undefined;
  description ? (course.description = description) : undefined;
  subtitle ? (course.subtitle = subtitle) : undefined;
  minGroupSize ? (course.minGroupSize = minGroupSize) : undefined;
  maxGroupSize ? (course.maxGroupSize = maxGroupSize) : undefined;
  studentJoinCode ? (course.studentJoinCode = studentJoinCode) : undefined;
  academicJoinCode ? (course.academicJoinCode = academicJoinCode) : undefined;
  adminJoinCode ? (course.adminJoinCode = adminJoinCode) : undefined;

  const updatedCourse = await course.save();

  res.json({
    message: `${updatedCourse.courseCode} ${updatedCourse.name} updated`,
  });
};

// @desc Delete a course
// @route DELETE /courses
// @access Private
const deleteCourse = async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId).exec();

  if (!course) {
    return res.status(400).json({ message: 'Course not found' });
  }

  const privileged = await isAdmin(course, req._id);
  if (!privileged) {
    return res.status(403).json({
      message: 'Not an admin of the course to delete.',
    });
  }

  // Drop all references from other schemas
  await User.updateMany({}, { $pull: { courses: { courseid: courseId } } });

  const groups = await Group.find({ courseId: courseId }).exec();

  await Promise.all(
    groups.map((group) =>
      Promise.all([
        User.updateMany({}, { $pull: { groupsJoined: group._id } }),
        Project.updateMany({}, { $pull: { groupsAssigned: group._id } }),
        group.deleteOne(),
      ])
    )
  );

  const projects = await Project.find({ courseId: courseId }).exec();

  await Promise.all(
    projects.map((project) =>
      Promise.all([
        User.updateMany({}, { $pull: { projectsOwned: project._id } }),
        Group.updateMany(
          { projectAssigned: project._id },
          { $set: { projectAssigned: null } }
        ),
        Group.updateMany({}, { $pull: { projectPreferences: project._id } }),
        project.deleteOne(),
      ])
    )
  );

  await course.deleteOne();

  res.json({ message: `${course.courseCode} ${course.name} deleted` });
};

// @desc The user joins a course
// @route POST /courses/join
// @access Private
const joinCourse = async (req, res) => {
  const { courseId, joinCode } = req.body;
  const course = await Course.findById(courseId).exec();

  if (!course) {
    return res.status(400).json({ message: 'Course not found' });
  }

  if (course.users.find((u) => u.userid.toString() == req._id.toString())) {
    return res
      .status(400)
      .json({ message: `You are already in ${course.name}` });
  }

  let role =
    course.studentJoinCode === joinCode
      ? 'student'
      : course.academicJoinCode === joinCode
        ? 'academic'
        : course.adminJoinCode === joinCode
          ? 'course-admin'
          : undefined;
  if (!role) {
    return res.status(400).json({ message: 'Course access code invalid.' });
  }
  course.users.push({ userid: req._id, role });
  setRoleInUser(req._id, course._id, role);

  const updatedCourse = await course.save();

  res.json({
    message: `Joined ${updatedCourse.courseCode} ${updatedCourse.name}`,
  });
};

// @desc The user leaves a course they are in
// @route POST /courses/leave
// @access Private
const leaveCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req._id;
  const course = await Course.findById(courseId).exec();

  if (!course) {
    return res.status(400).json({ message: 'Course not found' });
  }

  await User.updateOne(
    { _id: req._id },
    { $pull: { courses: { courseid: courseId } } }
  );

  await Course.updateOne(
    { _id: courseId },
    { $pull: { users: { userid: userId } } }
  );

  res.json({
    message: `Left ${course.courseCode} ${course.name}`,
  });
};

// @desc The admin user kicks a user from a specified course
// @route POST /courses/kick
// @access Private
const kick = async (req, res) => {
  const { courseId, toKickId } = req.body;
  const userId = req._id;
  const course = await Course.findById(courseId).exec();

  if (!course) {
    return res.status(400).json({ message: 'Course not found' });
  }

  const privileged = await isAdmin(course, userId);
  if (!privileged) {
    return res
      .status(403)
      .json({ message: 'Not an admin of the course to delete.' });
  }

  await User.updateOne(
    { _id: toKickId },
    { $pull: { courses: { courseid: courseId } } }
  );

  await Course.updateOne(
    { _id: courseId },
    { $pull: { users: { userid: toKickId } } }
  );

  res.json({
    message: `Kicked ${toKickId} from ${course.courseCode} ${course.name}`,
  });
};

module.exports = {
  getAllCourses,
  createNewCourse,
  updateCourse,
  deleteCourse,
  joinCourse,
  leaveCourse,
  kick,
};

// Sets the given course role for the given user.
const setRoleInUser = async (userid, courseid, role) => {
  const user = await User.findById(userid).exec();
  user.courses.push({ courseid, role });
  return user.save();
};

// Check for course or site admin roles.
const isAdmin = async (course, reqId) => {
  if (
    course.users.find(
      (u) =>
        u.role === 'course-admin' && u.userid.toString() === reqId.toString()
    )
  ) {
    return true;
  } else {
    const user = await User.findById(reqId).exec();
    return user.isSiteAdmin;
  }
};
