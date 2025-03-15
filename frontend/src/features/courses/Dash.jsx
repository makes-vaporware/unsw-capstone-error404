import { useRef, useState } from "react"
import useAuth from "../../hooks/useAuth"
import { useGetCoursesQuery } from "./coursesApiSlice"
import CourseCardJoin from "../../components/CourseCardJoin"
import CourseCardBasic from "../../components/CourseCardBasic"
import NewCourseModal from "../../components/modals/NewCourseModal"
import { PulseLoader } from "react-spinners"

const Dash = () => {
  const { userId, isSiteAdmin } = useAuth()

  const errRef = useRef()

  const [createOpen, setCreateOpen] = useState(false) 

  // api calls
  const {
    data,
    isSuccess: isGetSuccess,
    isLoading: isGetLoading,
    isError: isGetError,
    error: getError
  } = useGetCoursesQuery()

  let coursesDisplay
  let myCoursesDisplay
  if (isGetSuccess) {
    const {ids, entities } = data
    // find courses the user has access to
    let filteredIds
    if (isSiteAdmin) {
        filteredIds = [...ids]
    } else {
      filteredIds = ids.filter(id => {
        let inCourse = false
        for (const user of entities[id].users) {
          if (user?.userid === userId) inCourse = true
        }
        return inCourse
      })
    }

    // display all courses
    if (ids.length) {
      coursesDisplay = ids.map(id => {
        return <CourseCardJoin
          key={id} 
          course={entities[id]}
          />
      })
      // most recent first
      coursesDisplay.reverse()
    } else {
      coursesDisplay = <> No courses found </>
    }

    // display user courses
    if (!filteredIds?.length) myCoursesDisplay = <>You are not in any courses</>
    else {
      myCoursesDisplay = filteredIds.map(id => {
        return <CourseCardBasic 
          key={id} 
          course={entities[id]} 
          />
      })
      myCoursesDisplay.reverse()
    }
  } else if (isGetLoading) {
    coursesDisplay = <PulseLoader />
    myCoursesDisplay = <PulseLoader />
  } else if (isGetError) {
    myCoursesDisplay, coursesDisplay = <div> Error loading courses </div>
  }

  if (getError?.data?.message === "No courses found") myCoursesDisplay = <>You are not in any courses</>
  const instructions = <div className="manual">Welcome to AlignEd! To view and edit your profile, use the button in the header. To join a pre-existing course, ask your course admin for the join code, then click 'Join' below to enter. To create your own course, click the button below.</div>

  const content = <div className="page">
    <div className="page-title">My Courses </div>
    { instructions }
    <button className="button--primary" onClick={() => setCreateOpen(true)}>Create a Course</button>
    { createOpen && <NewCourseModal open={createOpen} setOpen={setCreateOpen}/> }
    <div className="card__container">
      { myCoursesDisplay }
    </div>
    <h2>All Courses </h2>
    <div className="card__container">
      { coursesDisplay }
    </div>
  </div>


  return content
}

export default Dash