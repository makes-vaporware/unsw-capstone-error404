import { useNavigate } from "react-router-dom"
import { useGetAllProjectsQuery } from "../features/projects/projectsApiSlice"
import ClientStr from "./ClientStr"
import { PulseLoader } from "react-spinners"
import { useDispatch } from "react-redux"
import { setCurrentProject } from "../features/projects/projectSlice"

const AssignedProject = ({ id }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { project } = useGetAllProjectsQuery("projectsList", {
    selectFromResult: ({ data }) => ({
      project: data?.entities[id]
    })
  }) 

  const viewProject = () => {
    dispatch(setCurrentProject(project.id))
    navigate('/dash/projects/view')
  }

  if (project) {
    return <div className="card" style={{maxWidth: '30%'}}>
      <span>Assigned Project:</span>
      <h3 className="clickable" onClick={viewProject}>{project.name}</h3>
      <span> clients: <ClientStr ids={project.clients} /></span>
      <div>{project.subtitle}</div>
    </div>
  } else return <PulseLoader />

}

export default AssignedProject