import { PulseLoader } from "react-spinners";
import { useGetUsersQuery } from "../features/users/usersApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentCourse } from "../features/courses/courseSlice";
import { selectCurrentProject } from "../features/projects/projectSlice";
import { useGetAllProjectsQuery } from "../features/projects/projectsApiSlice";

const ClientDropdown = ({ name, setUser, checkUnowned }) => {
  const courseId = useSelector(selectCurrentCourse)
  const projectId = useSelector(selectCurrentProject)

  const {
    data: users,
    isSuccess: isGetSuccess,
    isLoading: isGetLoading,
    error: getError,
  } = useGetUsersQuery()

  const { project } = useGetAllProjectsQuery("projectsList", {
    selectFromResult: ({ data }) => ({
      project: data?.entities[projectId]
    })
  })

  const onChange = e => {
    let ownerId
    for (const id of users.ids) {
      if (users.entities[id].email === e.target.value) {
        ownerId = users.entities[id]
      }
    }
    setUser(ownerId)
  }
  
  let usersOptionList
  if (isGetSuccess) {
    let idsList
    // find all clients in course
    idsList = users.ids.filter(id => users.entities[id].courses
      .find(course => course.courseid === courseId 
                      && course.role !== "student"))
    // check do not own
    if (project && checkUnowned) idsList = idsList.filter(id => !project.clients.includes(id))
    usersOptionList = idsList.map(id => {
      const user = users.entities[id]
      return <option value={user.email} id={user.id} key={user.id}/>
  })
  } else if (isGetLoading) return <PulseLoader />

  return <>
    <input list="users" 
    name={name}
    onChange={onChange}/>
    <datalist id="users">
    { usersOptionList }
    </datalist> 
  </>
}

export default ClientDropdown