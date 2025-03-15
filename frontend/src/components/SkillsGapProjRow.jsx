import Arrow from "./Arrow"

const SkillsGapProjRow = ({ skill, value, goal}) => {
  let rowClass = ''
  if (value >= goal) rowClass = 'skill-goal-reached'
  else if (value <= goal*0.6) rowClass = 'skill-goal-unreached'

  return <tr><td><b>{skill + ': '}</b></td><td className={rowClass}>{value}</td><td className={rowClass}><Arrow /></td><td className={rowClass}>{goal}</td></tr>
}

export default SkillsGapProjRow