import { PulseLoader } from "react-spinners"
import { useGetAllProjectsQuery } from "./projectsApiSlice"
import useAuth from "../../hooks/useAuth"
import { useSelector } from "react-redux"
import { selectCurrentCourse } from "../courses/courseSlice"
import { useEffect, useState } from "react"
import NewProjectModal from "../../components/modals/NewProjectModal"
import { useGetGroupsQuery } from "../groups/groupsApiSlice"
import ProjectRecommendations from "../../components/ProjectRecommendations"
import ProjectCard from "../../components/ProjectCard"

const Projects = () => {
  const { isAcademic, isStudent, userId } = useAuth()
  const courseId = useSelector(selectCurrentCourse)
  
  const [newProjOpen, setNewProjOpen] = useState(false)
  const [groupId, setGroupId] = useState()

  const {
    data: projData,
    isSuccess: isGetPSuccess,
    isLoading: isGetPLoading,
    isError: isGetPError
  } = useGetAllProjectsQuery()

  const {
    data: groupData,
    isSuccess: isGroupsSuccess,
  } = useGetGroupsQuery()

  useEffect(() => {
    if (isGroupsSuccess) {
      // find user's group
      const id = groupData.ids.filter(id => groupData.entities[id].courseId === courseId)
        .find(id => groupData.entities[id].members.includes(userId))
      setGroupId(id)
    }
  }, [isGroupsSuccess])

  let loadedProjects
  if (isGetPSuccess) {
    const projects = projData.entities
    // get course projects
    let projectIds = projData.ids.filter(id => projects[id].courseId === courseId)

    // academics can only see their own projects
    if (isAcademic) projectIds = projectIds.filter(id => projects[id].clients.includes(userId))

    if (!projectIds.length) loadedProjects = <div className="message" style={{ width: '100%' }}>There are no projects to see here</div>
    else loadedProjects = projectIds.map(id => <ProjectCard project={projects[id]} key={id} />).reverse()

  } else if (isGetPLoading) loadedProjects = <PulseLoader />
  else if (isGetPError) loadedProjects = <div className="message errmsg">Error loading projects</div>

  const newProjectButton = <button
    name="button-open-project-creation"
    className="button--primary"
    onClick={() => setNewProjOpen(true)}
    >
      New Project
    </button>

  const info = <div className="manual">Click on a project to see its details. { isStudent && 'Your group owner can set project preferences from the group page.' }</div>

  return <div className="page">
    <div className="page-title">Projects</div> <br/>
    { !isStudent && newProjectButton } <br/>
    { info }<br/>
    { newProjOpen && <NewProjectModal open={newProjOpen} setOpen={setNewProjOpen} /> }
    { groupId && <ProjectRecommendations groupId={groupId}/>}
    <div className="card__display-box" >
      <h3>{`${isAcademic ? "My": "All"}`} Projects</h3>
      <div className="card__container">
        {loadedProjects}
      </div>
    </div>
  </div>
}

export default Projects