import { useEffect, useState } from "react"
import { useGetUsersQuery } from "../features/users/usersApiSlice"
import { useDispatch } from "react-redux"
import { setCurrentUser } from "../features/users/userSlice"
import { useNavigate } from "react-router-dom"

const ClientStr = ({ ids }) =>{
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [clientList, setClientList] = useState(<></>)

  const {
    data,
    isSuccess: isUsersSuccess,
  } = useGetUsersQuery()

  const viewUser = e => {
    dispatch(setCurrentUser(e.target.id))
    navigate('/dash/profile/view')
  }

  useEffect(() => {
    if (isUsersSuccess) {
      const numClients = ids.length
      setClientList(ids.map((clientId, i) => {
        const comma = i !== numClients - 1 ? ', ' : ''
        return <span className="clickable" onClick={viewUser} id={clientId} key={clientId}>{data.entities[clientId].name + comma}</span>
      }))
    }
  }, [data, isUsersSuccess, ids])

  return clientList
}

export default ClientStr