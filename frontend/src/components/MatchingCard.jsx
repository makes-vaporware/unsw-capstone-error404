import React from 'react'

function MatchingCard({matchObject, allProjects, allGroups}) {
  return (
    <div>
        <div className='card__title'>Group: {allGroups[matchObject.groupId].name}</div>
        <div>Current Project: {allGroups[matchObject.groupId].projectAssigned ? allProjects[allGroups[matchObject.groupId].projectAssigned].name : "none"}</div>
        {matchObject.projectId &&  <div>Suggested Project: {allProjects[matchObject.projectId].name}</div>}
        {matchObject.score && <div>Match Score: {matchObject.score}</div>}
    </div>
  )
}

export default MatchingCard