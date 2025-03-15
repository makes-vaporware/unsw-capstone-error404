import { PulseLoader } from "react-spinners"
import { useGetGroupSCPSumQuery } from "../features/groups/groupsApiSlice"
import { useGetUserSCPQuery } from "../features/users/usersApiSlice"
import SkillsGapUserRow from "./SkillsGapUserRow"

const SkillsGapUserGroup = ({ userId, groupId, maxGroupSize = 6, groupMembers }) => {
  console.log(userId)
  const {
    data: groupSCP,
    isSuccess: isSCPSuccess,
    isLoading: isSCPLoading,
  } = useGetGroupSCPSumQuery({ groupId: groupId })

  const {
    data: userSCP,
    isSuccess: isUserSCPSuccess,
    isLoading: isUserSCPLoading,
  } = useGetUserSCPQuery({ userId })

  if (isSCPSuccess && (!userId || isUserSCPSuccess)) {
    const toPercent = 10 / maxGroupSize
    const PM = Math.round(groupSCP.PM * toPercent)
    const DE = Math.round(groupSCP.DE * toPercent)
    const SD = Math.round(groupSCP.SD * toPercent)
    const ML = Math.round(groupSCP.ML * toPercent)
    const UX = Math.round(groupSCP.UX * toPercent)
    const BA = Math.round(groupSCP.BA * toPercent)
    let PM2, DE2, SD2, ML2, UX2, BA2
    if (userId) {
      PM2 = Math.round(PM + userSCP.PM * toPercent)
      DE2 = Math.round(DE + userSCP.DE * toPercent)
      SD2 = Math.round(SD + userSCP.SD * toPercent)
      ML2 = Math.round(ML + userSCP.ML * toPercent)
      UX2 = Math.round(UX + userSCP.UX * toPercent)
      BA2 = Math.round(BA + userSCP.BA * toPercent)
    }

    return <div className="card__display-box" style={{ display: 'flex', justifyContent: 'center'}}>
      <div >
        <table>
          <thead>
            <tr><th></th> <th>Group Skills</th><th></th><th>{userId && 'With your contribution'}</th></tr>
          </thead>
          <tbody>
            <tr>
              <td> <b>Project Management: </b></td><SkillsGapUserRow group={PM} user={PM2} members={groupMembers}/>
            </tr>
            <tr>
              <td><b>Data Engineering: </b></td><SkillsGapUserRow group={DE} user={DE2} members={groupMembers} />
            </tr>
            <tr>
              <td><b>Software Development: </b></td><SkillsGapUserRow group={SD} user={SD2} members={groupMembers} />
            </tr>
            <tr>
              <td><b>Machine Learning Engineering: </b></td><SkillsGapUserRow group={ML} user={ML2} members={groupMembers} />
            </tr>
            <tr>
              <td><b>UI/UX Design: </b></td><SkillsGapUserRow group={UX} user={UX2} members={groupMembers} />
            </tr>
            <tr>
              <td><b>Business Analysis/Client Interaction: </b></td><SkillsGapUserRow group={BA} user={BA2} members={groupMembers} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  } else if (isSCPLoading || isUserSCPLoading) return <PulseLoader />
  else return <div>Error loading skills</div>
}


export default SkillsGapUserGroup