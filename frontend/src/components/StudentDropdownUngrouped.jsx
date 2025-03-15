import { PulseLoader } from "react-spinners";
import { useGetUsersQuery } from "../features/users/usersApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentCourse } from "../features/courses/courseSlice";
import { useGetGroupsQuery } from "../features/groups/groupsApiSlice";

const StudentDropdownUngrouped = ({ name, setUser }) => {
  const courseId = useSelector(selectCurrentCourse)
  const {
    data: users,
    isSuccess: isGetSuccess,
    isLoading: isGetLoading,
  } = useGetUsersQuery();

  const {
    data: groups,
    isSuccess: isGrSuccess,
  } = useGetGroupsQuery();

  const onChange = e => {
    let ownerId
    for (const id of users.ids) {
      if (users.entities[id].name === e.target.value) {
        ownerId = users.entities[id]
      }
    }
    setUser(ownerId)
  }

  let usersOptionList
  if (isGetSuccess) {
    let idsList
    if (isGrSuccess) {
      // find all students in course
      idsList = users.ids.filter(id => users.entities[id].courses
        .find(course => course.courseid === courseId 
                        && course.role === "student"))
      //check that the user is not in any groups in this course
      idsList = idsList.filter(userId => !groups.ids
        .find(groupId => groups.entities[groupId].courseId === courseId 
                          && groups.entities[groupId].members.includes(userId)))
    }
    usersOptionList = idsList.map(id => {
      const user = users.entities[id]
      return <option value={user.name} id={user.id} key={user.id}/>
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

export default StudentDropdownUngrouped