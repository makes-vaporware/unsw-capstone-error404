export const getStudentsInCourse = (users, ids, courseId) => {
  let students = []
  checkUsers: for (const id of ids) {
    for (const course of users[id].courses) {
      if (course.courseid === courseId) {
        if (course.role === "student") {
          students.push(users[id])
        }
        else continue checkUsers
      }
    }
  }
  return students
}

