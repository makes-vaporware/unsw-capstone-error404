import useAuth from "../hooks/useAuth"
import JoinCourseModal from "./modals/JoinCourseModal"
import CourseCard from "./CourseCard"
import { useState } from "react"

const CourseCardJoin = ({ course }) => {
  const { userId } = useAuth()
  const [open, setOpen] = useState(false)

  let inCourse = false
  for (const user of course.users) {
    if (user.userid === userId) inCourse = true
  }

  return <div className="card card--small" >
    <CourseCard course={course} />
    { !inCourse && <button className="button--primary" onClick={() => setOpen(true)}>Join</button>}
    { open && <JoinCourseModal open={open} setOpen={setOpen} courseId={course.id}/> }
  </div>
}

export default CourseCardJoin