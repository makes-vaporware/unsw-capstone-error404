import Arrow from "./Arrow"
import SkillPct from "./SkillPct"

const SkillsGapUserRow = ({ group, user, members}) => {
  let rowClass = ''
  if (user - group >= group / members * 1.25 && user - group <= group / members * 2.5) rowClass = 'skill-goal-reached'
  if (user || user === 0) return <><td className={rowClass}><SkillPct value={group}/></td><td className={rowClass}><Arrow /></td><td className={rowClass}><SkillPct value={user}/></td></>
  else return <><td className={rowClass}><SkillPct value={group}/></td></>
}

export default SkillsGapUserRow