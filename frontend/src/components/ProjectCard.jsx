import { useDispatch } from "react-redux"
import useAuth from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { setCurrentProject } from "../features/projects/projectSlice"

const ProjectCard = ({ project, match }) => {
  const { userId, isCourseAdmin } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const view = () => {
    dispatch(setCurrentProject(project.id))
    navigate("/dash/projects/view")
  }

  const subtitle = project.subtitle ? <>{ project.subtitle }</> : <>No summary is available for this project</>

  if (!project) return null
  return <div className="card card--small" onClick={view}>
      <div className="card__header">
        <div className="card__title clickable">
          { project.name } 
        </div>
        <div className="card__code"> {project.category } { isCourseAdmin && project.clients.includes(userId) && ' - owned' } </div>
      </div>
      { match && <div> <b>{match + '% ' } </b> match</div>} <br/>
      <div className="card__description"><em>{subtitle}</em></div>
    </div>
}

export default ProjectCard