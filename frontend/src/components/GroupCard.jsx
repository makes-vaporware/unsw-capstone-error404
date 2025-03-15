import { useEffect } from "react"
import { useJoinGroupMutation } from "../features/groups/groupsApiSlice"
import { PulseLoader } from "react-spinners"
import GroupMembersList from "./GroupMembersList"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setCurrentGroup } from "../features/groups/groupSlice"
import { Divider } from "@mui/material"


const GroupCard = ({ group, canJoin, setError, score }) => {
  if (!group) return null
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [joinGroup, {
    isJoinSuccess,
    isJoinLoading,
    error
  }] = useJoinGroupMutation()

  const handleJoin = () => joinGroup({ groupId: group.id })
  const handleView = () =>{
    dispatch(setCurrentGroup(group.id))
    navigate('/dash/groups/view')
  }
  useEffect(() => {
    if (error && setError) setError(error)
    else if (setError) setError(null)
  }, [error])

  let scoreStr
  if (score) {
    if (isNaN(score)) score = 0
    scoreStr = `${score}% match`
  }
  if (isJoinLoading) return <PulseLoader />
  return <div className="card card--small"  /* onClick={handleClick} */ >
    <div className="card__header">
      <div className="card__title clickable" onClick={handleView}>
        {group.name} 
      </div>
    </div>
    {scoreStr && <div className="card__code">{scoreStr}</div>}
    <Divider aria-hidden={true} variant="middle" />
    <div className="card__description">{group.description}</div>
    <div className="card__utils">
      { canJoin && <button
        title="Join Group"
        className="button--primary"
        onClick={handleJoin}
      >
        Join 
      </button>}
      <GroupMembersList group={group}/>
    </div>
  </div>
}
export default GroupCard