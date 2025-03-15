import GroupCardDisplay from "../../components/GroupCardDisplay"
import { useSelector } from "react-redux"
import { selectCurrentGroup } from "./groupSlice"
import { useEffect, useState } from "react"
import { useGetGroupsQuery } from "./groupsApiSlice"
import useAuth from "../../hooks/useAuth"
import {  useGetUsersQuery } from "../users/usersApiSlice"
import SkillsGapUserGroup from "../../components/SkillsGapUserGroup"
import { selectCurrentCourse } from "../courses/courseSlice"
import { useGetCoursesQuery } from "../courses/coursesApiSlice"


const GroupDash = () => {
  const groupId = useSelector(selectCurrentGroup)
  const courseId = useSelector(selectCurrentCourse)

  const { isCourseAdmin, userId, isStudent } = useAuth()
  const [isGroupOwner, setIsGroupOwner] = useState(false)

  const {
    data: groups,
    isSuccess: isGetSuccess
  } = useGetGroupsQuery()

  const { course } = useGetCoursesQuery("coursesList", {
    selectFromResult: ({ data }) => ({
      course: data?.entities[courseId],
    }),
  })

  const {
    data: users,
    isSuccess: isUsersSuccess
  } = useGetUsersQuery()

  useEffect(() => {
    if (isGetSuccess) {
      setIsGroupOwner(groups.entities[groupId]?.owner === userId)
    }
  }, [groups])

  let skillIds = []
  if (isGetSuccess && isUsersSuccess) {
    // for each users skills, if they are not already listed add to the list
    groups.entities[groupId].members.forEach(id => users.entities[id].skills
      .filter(skillId => !skillIds.includes(skillId)) 
      .forEach(skillId => skillIds.push(skillId)))
  }

  let compId
  if (!groups.entities[groupId].members.includes(userId) && isStudent) compId = userId

  const studentInfo = <div className="manual">{isGroupOwner ? "Here you can add or remove members from your group, or update your project prefereces. This is also where you can see your assigned project" : 'Here you can see your group details and your assigned project'}  </div>
  const percentageExplanation = <div> The inputted skills of each group member are aggregated and analysed to form a skill category profile of the group's strength in key areas. These skills are then converted to a percentage of the highest possible score for a full group. </div>
  const comparisonExplanation1 = <div> Here you can see the impact you would have upon joining this group. </div>
  const comparisonExplanation2 = <div> The second column displays the effect your skills would have on the group total. </div>

  const studentInfo2 = <div className="manual">
    { compId && comparisonExplanation1 }
    { percentageExplanation }
    { compId && comparisonExplanation2 }
  </div>
  const adminInfo = <div className="manual">{percentageExplanation}</div>

  return <div className="page">
    <br/>
    { isStudent && studentInfo}
    <GroupCardDisplay groupId={groupId}/>
    <SkillsGapUserGroup userId={compId} groupId={groupId} maxGroupSize={course?.maxGroupSize} groupMembers={groups.entities[groupId]?.members?.length}/>
    { isStudent && studentInfo2 }
    { isCourseAdmin && adminInfo}
  </div>
}

export default GroupDash