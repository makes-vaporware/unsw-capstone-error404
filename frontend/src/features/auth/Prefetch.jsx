import { store } from '../../app/store.js'
import { usersApiSlice } from '../users/usersApiSlice.js'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

const Prefetch = () => {
  useEffect(() => {
    const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate())
    const user = store.dispatch(usersApiSlice.endpoints.getUser.initiate())
    return () => {
      users.unsubscribe()
      user.unsubscribe()
    }
  }, [])

  return <Outlet />
}

export default Prefetch