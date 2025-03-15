import { useGetSkillsQuery } from "../features/skills/skillsApiSlice"

const SkillList = ({ ids }) => {  
  const { data } = useGetSkillsQuery()

  let skillsContent
  if (data) skillsContent = ids.map(id => <p key={id} ><b>{data.entities[id].name} : {' '} </b>{data.entities[id].summary}</p>)
  return skillsContent
}

export default SkillList