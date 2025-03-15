import { useSelector } from "react-redux"
import { selectCurrentUser } from "./userSlice"
import { useGetUserQuery, useGetUserSCPQuery } from "./usersApiSlice"
import { PulseLoader } from "react-spinners"
import { useGetCoursesQuery } from "../courses/coursesApiSlice"
import SCPList from "../../components/SCPList"
import { selectCurrentCourse } from "../courses/courseSlice"
import { Navigate } from "react-router-dom"
import { useGetAllProjectsQuery } from "../projects/projectsApiSlice"

const ViewProfile = () => {
  const viewUserId = useSelector(selectCurrentUser)
  if (!viewUserId) return <Navigate to="/dash" />

  const courseId = useSelector(selectCurrentCourse)

  const {
    data,
    isSuccess,
    isLoading
    } = useGetUserQuery({ userId: viewUserId })

  const { data: courses, isSuccess: isCoursesSuccess } = useGetCoursesQuery({
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: scp,
    isSuccess: isSCPSuccess,
    isLoading: isSCPLoading,
    isError: isSCPError
  } = useGetUserSCPQuery({ userId: viewUserId })

  const {
    data: projects,
    isSuccess: isGetProjectsSuccess,
    isError: isGetProjectsError,
    isLoading: isGetProjectsLoading
  } = useGetAllProjectsQuery()


  if (isSuccess) {
    let courseString = ""
    let projectsContent
    let isStudent = false
    let isStudentNow = false
    let isClientNow = false
    if (isCoursesSuccess) {
      for (const course of data.courses) {
        // create string of courses
        const loadedCourse = courses?.entities[course.courseid]
        if (courseString !== "") courseString = courseString + ", "
        else courseString = "Courses: "
        courseString =
          courseString +
          loadedCourse?.name +
          " (" +
          loadedCourse?.courseCode +
          ")"
        // check if user is student in some course
        for (const user of loadedCourse.users) {
          if (user.userid === viewUserId && user.role === "student")
            isStudent = true
        }
        // check status in selected course
        if (loadedCourse.id === courseId) {
          const role = loadedCourse.users.find(user => user.userid === viewUserId).role
          if (role === "student") isStudentNow = true
          if (role === "academic" || role === "course-admin") {
            isClientNow = true
            // get projects
            let projectsStr = ''
            if (isGetProjectsSuccess) {
              for (const projId of data.projectsOwned) {
                const loadedProject = projects?.entities[projId]
                if (loadedProject.courseId === courseId) {
                  if (projectsStr !== "") projectsStr = projectsStr + ", "
                  else projectsStr = "Projects: "
                  projectsStr =
                    projectsStr +
                    loadedProject?.name 
                }
              }
              projectsContent = projectsStr
            } else if (isGetProjectsLoading) projectsContent = <>Projects: <PulseLoader /></>
            else if (isGetProjectsError) projectsContent = <>Sorry, projects could not be loaded</>
          }
        }
      }
    }

    let studentSkills
    if (isSCPSuccess) {
      studentSkills = <SCPList scp={scp} title={'Skill Level (0-10)'}/>
    } else if (isSCPLoading) studentSkills = <PulseLoader />
    else if (isSCPError) studentSkills = <div className="message">Sorry, this user's skills could not be loaded</div>

    return <>
    <div className="page-title">{data.name}</div>
    { (isClientNow ) && <p>Email: {data.email}</p>}
    <p>University: {data.university}</p>
    <p>
      {data.courses.length > 0 ? (
        <>{courseString}</>
      ) : (
        <>This user is not in any courses</>
      )}
    </p>
    { isStudentNow && studentSkills }
    { isClientNow && projectsContent }
  </>
  } else if (isLoading) return <PulseLoader />
  else return <div>Sorry, this profile could not be loaded</div>
}

export default ViewProfile
