import { useGetAllProjectsQuery, useGetProjectRecsQuery } from "../features/projects/projectsApiSlice"
import { PulseLoader } from "react-spinners"
import ProjectCard from "./ProjectCard"

const ProjectRecommendations = ({ groupId, limit }) =>{
  if (!groupId) return <PulseLoader />

  const {
    data: recs,
    isSuccess: isRecSuccess,
    isError: isRecError,
    isLoading: isRecLoading
  } = useGetProjectRecsQuery({ groupId })

  const {
    data: projects,
    isSuccess: isProjSuccess,
    isLoading: isProjLoading,
    isError: isProjError
  } = useGetAllProjectsQuery()

  let loadedRecs
  if (isRecSuccess && isProjSuccess) {
    let recsLimited = recs
    if (limit) recsLimited = recs.slice(0, limit)

      loadedRecs = recsLimited.map(rec => <ProjectCard key={rec.projectId} project={projects.entities[rec.projectId]} match={rec.score}/>)
  } else if (isRecLoading || isProjLoading) loadedRecs = <PulseLoader />
  else if (isRecError || isProjError) loadedRecs = <div> Sorry, recommendations could not be loaded </div>

  return <div className="card__display-box">
    <h3>Projects Recommended For You</h3>
    <div className="card__container">
    { loadedRecs }
    </div>
  </div>
}

export default ProjectRecommendations