const Course = require('../models/Course');
const User = require('../models/User');

// @desc Change a user between a simple user, or a site admin.
// @route PATCH /admin/changesiterole
// @access Private
const changeSiteRole = async (req, res) => {
  const user = await User.findById(req._id).exec();
  if (!user.isSiteAdmin) {
    return res.status(403).json({
      message: 'Not an admin of the site.',
    });
  }
  const userToChange = await User.findById(req.body.userId).exec();
  await User.updateOne(
    { _id: req.body.userId },
    { isSiteAdmin: req.body.becomeSiteAdmin }
  );

  res.json({
    message: `User ${userToChange.name} is${
      req.body.becomeSiteAdmin ? '' : ' not'
    } a site admin now.`,
  });
};

// @desc Change a user between a student, academic or course-admin for a course.
// @route PATCH /admin/changesiterole
// @access Private
const changeCourseRole = async (req, res) => {
  const { courseId, userId, newRole } = req.body;

  const user = await User.findById(req._id).exec();
  if (
    !user.isSiteAdmin &&
    user.courses.find((c) => c.courseid.toString() === courseId).role !==
      'course-admin'
  ) {
    return res.status(403).json({
      message: 'Not an site admin or admin of the course.',
    });
  }

  const res1 = await User.updateOne(
    { _id: userId, 'courses.courseid': courseId },
    { $set: { 'courses.$.role': newRole } }
  );

  const res2 = await Course.updateOne(
    { _id: courseId, 'users.userid': userId },
    { $set: { 'users.$.role': newRole } }
  );

  if (res1.matchedCount !== 1 || res2.matchedCount !== 1) {
    res.status(400).json({ message: `Unable to update user role in course.` });
  }
  const course = await Course.findById(courseId).exec();
  const userToChange = await User.findById(userId).exec();

  res.json({
    message: `User ${userToChange.name} is now a ${newRole} of ${course.courseCode} ${course.name}.`,
  });
};

module.exports = {
  changeSiteRole,
  changeCourseRole,
};
