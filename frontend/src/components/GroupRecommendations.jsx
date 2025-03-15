import { PulseLoader } from "react-spinners"
import { useGetGroupsQuery, useRecommendGroupsQuery } from "../features/groups/groupsApiSlice"
import useAuth from "../hooks/useAuth"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { selectCurrentCourse } from "../features/courses/courseSlice"
import GroupCard from "./GroupCard"

const GroupRecommendations = ({ limit, canJoin }) =>{
  const courseId = useSelector(selectCurrentCourse)
  const { userId } = useAuth()

  const [joinError, setJoinError] = useState(null)
  const [errMsg, setErrMsg] = useState('')
  const [groupId, setGroupId] = useState(true)

  const errRef = useRef();

  const {
    data: recs,
    isSuccess: isRecSuccess,
    isError: isRecError,
    isLoading: isRecLoading,
  } = useRecommendGroupsQuery({ courseId })

  const {
    data: groups,
    isSuccess: isGroupSuccess,
    isLoading: isGroupLoading,
    isError: isGroupError,
  } = useGetGroupsQuery()


  useEffect(() => {
    if (isGroupSuccess) {
      // find user's group
      const id = groups.ids.filter(id => groups.entities[id].courseId === courseId)
        .find(id => groups.entities[id].members.includes(userId))
      if (id) setGroupId(id)
    }
  }, [isGroupSuccess])

  useEffect(() => {
    if (joinError) {
      setErrMsg(joinError)
      errRef.current.focus()
    } else setErrMsg('')
  }, [joinError])

  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <p className={errClass} aria-live="assertive" ref={errRef}>{errMsg}</p>

  if (groups?.entities[groupId]?.members?.includes(userId)) return null

  let loadedRecs
  if (isRecSuccess && isGroupSuccess) {
    let recsLimited = recs
    if (limit) recsLimited = recs.slice(0, limit)

    if (recsLimited.length) {
    loadedRecs = recsLimited.filter(obj => !groups.entities[obj.groupId]?.isPrivate).map(obj => <GroupCard
      key={obj.groupId}
      group={groups.entities[obj.groupId]}
      score={obj.score}
      canJoin={canJoin}
      setError={setJoinError}
    />)
    } else loadedRecs = <div> No recommendations found </div>
  } else if (isRecLoading || isGroupLoading) loadedRecs = <PulseLoader />
  else if (isRecError || isGroupError) loadedRecs = <div> Sorry, recommendations could not be loaded </div>

  return <div className="card__display-box">
    <div>
      <h3>Groups Recommended For You</h3>
    </div>
    { errMessage }
    <div className="card__container">{loadedRecs}</div>
  </div>
}



export default GroupRecommendations