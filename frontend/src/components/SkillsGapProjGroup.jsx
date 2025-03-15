import { PulseLoader } from "react-spinners"
import { useGetGroupSCPAvgQuery } from "../features/groups/groupsApiSlice"
import { useGetAllProjectsQuery } from "../features/projects/projectsApiSlice"
import { useEffect, useState } from "react"
import SkillsGapProjRow from "./SkillsGapProjRow"

const SkillsGapProjGroup = ({ projectId, groupId, isSmall }) => {
  if (!projectId) return <PulseLoader />

  const [projSCP, setProjSCP] = useState({})

  const {
    data: groupSCP,
    isSuccess: isSCPSuccess,
    isLoading: isSCPLoading,
    isError: isSCPError,
    error: scpError
  } = useGetGroupSCPAvgQuery({ groupId: groupId })

  const { project } = useGetAllProjectsQuery("projectsList", {
    selectFromResult: ({ data }) => ({
      project: data?.entities[projectId],
    })
  })

  useEffect(() => {
    if (project) {
      setProjSCP(project.skillCategoryProfile)
    }
  }, [project])
  

  let content
  if (isSCPSuccess && project) {
    content =  <>
        <table>
          <thead>
            <tr><th></th><th>Group Skills</th><th></th><th>Recommended</th></tr>
          </thead>
          <tbody>
            <SkillsGapProjRow skill="Project Management" value={groupSCP.PM} goal={projSCP.PM} />
            <SkillsGapProjRow skill="Data Engineering" value={groupSCP.DE} goal={projSCP.DE} />
            <SkillsGapProjRow skill="Software Development" value={groupSCP.SD} goal={projSCP.SD} />
            <SkillsGapProjRow skill="Machine Learning Engineering" value={groupSCP.ML} goal={projSCP.ML} />
            <SkillsGapProjRow skill="UI/UX Design" value={groupSCP.UX} goal={projSCP.UX} />
            <SkillsGapProjRow skill="Business Analysis/Client Interaction" value={groupSCP.BA} goal={projSCP.BA} />
          </tbody>
        </table>
        <div><span className="skill-goal-reached">Goal Met</span>&emsp;&emsp;<span className="skill-goal-unreached"> Goal Not Met</span></div> </>
  } else if (!groupId) {
    content =  
    <table >
      <thead>
        <tr><th></th><th>Recommended Skills</th></tr>
      </thead>
      <tbody>
        <tr>
          <td> <b>Project Management: </b></td><td>{projSCP.PM}</td> 
        </tr>
        <tr>
          <td><b>Data Engineering: </b></td><td>{projSCP.DE}</td> 
        </tr>
        <tr>
          <td><b>Software Development: </b></td><td>{projSCP.SD}</td> 
        </tr>
        <tr>
          <td><b>Machine Learning Engineering: </b></td><td>{projSCP.ML}</td> 
        </tr>
        <tr>
          <td><b>UI/UX Design: </b></td><td>{projSCP.UX}</td>
        </tr>
        <tr>
          <td><b>Business Analysis/Client Interaction: </b></td><td>{projSCP.BA}</td>
        </tr>
      </tbody>
    </table>
  } else if (isSCPLoading ) content = <PulseLoader />
  else content = <div>Error loading skills</div>

  return <div className="card__display-box" style={{ display: 'flex', justifyContent: 'center'}}>
      <div >
        {content}
      </div>
    </div>
}


export default SkillsGapProjGroup