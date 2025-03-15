import { Divider } from "@mui/material"
import useAuth from "../hooks/useAuth"

const CourseCard = ({ course, clickable }) => {
  const { userId } = useAuth()

  let isCourseAdmin
  let isStudent
  let isAcademic
  for (const user of course.users) {
    if (user.userid === userId && user.role === "course-admin") isCourseAdmin = true
    else if (user.userid === userId && user.role === "student") isStudent = true
    else if (user.userid === userId && user.role === "academic") isAcademic = true
  }

  const subtitle = course.subtitle ? <>{course.subtitle}</> : <>No summary is available for this course</>
  const className = clickable ? "card__title clickable" : "card__title"

  return <>
    <div className="card__header">
      <div className={className}>
        {course.name} 
      </div>
      <div className="card__code">
        {course.courseCode} 
        { isCourseAdmin && " - admin"} 
        { isAcademic && " - academic" } 
        { isStudent && " - student" }
      </div>
    </div>
    <Divider aria-hidden="true" variant="middle"/>
    <div className="card__description"><em>{subtitle}</em></div>
  </>
}

export default CourseCard