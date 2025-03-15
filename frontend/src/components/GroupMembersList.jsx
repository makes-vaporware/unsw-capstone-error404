import { PulseLoader } from "react-spinners"
import { useGetUsersQuery } from "../features/users/usersApiSlice"
import useAuth from "../hooks/useAuth"
import { useDispatch } from "react-redux"
import { setCurrentUser } from "../features/users/userSlice"
import { useNavigate } from "react-router-dom"
import { Collapse, List, ListItem } from "@mui/material"
import { useState } from "react"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const GroupMembersList = ({ group, ownerOptions, makeOwnerFn, removeMemberFn }) => {
  const { userId } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const {
    data,
    isSuccess: isGetSuccess,
    isLoading: isGetLoading,
    isError: isGetError,
    error: getError
  } = useGetUsersQuery()
      
  const viewUser = e => {
    dispatch(setCurrentUser(e.target.id))
    navigate('/dash/profile/view')
  }

  let usersContent
  if (isGetSuccess) {
    usersContent = group.members.map(id => {
      const user = data.entities[id]
      return <ListItem key={id}>
        <span className="clickable" onClick={viewUser} id={user?.id}>{ user?.name }</span>
        { !(user?.id === userId) && ownerOptions && <span 
            style={{marginLeft: '5px', fontSize: '0.7em', cursor: 'pointer'}} 
            onClick={() => makeOwnerFn({ groupId: group.id, newOwnerId: id })} >
            Make Owner
        </span>}
        { !(user?.id === userId) && ownerOptions && <span 
            style={{marginLeft: '5px', fontSize: '0.7em', cursor: 'pointer'}} 
            onClick={() => removeMemberFn({ groupId: group.id, userId: id })} >
            Remove
        </span>}
        { group?.owner === user.id && <span 
          style={{marginLeft: '5px', fontSize: '0.7em' }} >
          Owner
        </span>}
      </ListItem>
    })
  } else if (isGetLoading) usersContent = <PulseLoader />
  else if (isGetError) usersContent = <p aria-live="assertive">{getError}</p>

  return <div>
    <span onClick={() => setOpen(!open)} className="clickable"><b>members</b> <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} /></span>
    <Collapse in={open}>
      <List dense={true}>{ usersContent }</List>
    </Collapse>
  </div>
}

export default GroupMembersList