import { useEffect, useRef, useState } from "react"
import Modal from "./Modal"
import { PulseLoader } from "react-spinners"
import { useAddClientToProjectMutation } from "../../features/projects/projectsApiSlice"
import ClientDropdown from "../ClientDropdown"
import { useSelector } from "react-redux"
import { selectCurrentProject } from "../../features/projects/projectSlice"

const AddClientModal = ({ open, setOpen }) => {  
  const errRef = useRef()
  const projectId = useSelector(selectCurrentProject)

  const [ addClient, {
    isSuccess,
    isLoading,
    isError,
    error
  }] = useAddClientToProjectMutation()

  const [client, setClient] = useState('')
  const [errMsg, setErrMsg] = useState('')
  // user input
  
  const handleSubmit = e => {
    e.preventDefault()
    if (!client) {
      setErrMsg('Please choose a possible client from the dropdown')
      errRef.current.focus()
    } else addClient({ projectId, clientId: client })
  }

  const handleCancel = e => {
    setClient('')
    setErrMsg('')
    setOpen(false)
  }

  useEffect(() => {
    if (isSuccess) {
      setClient('')
      setErrMsg('')
      setOpen(false)
    }
  }, [isSuccess])

  useEffect(() =>{
    if (isError) {
      setErrMsg(error?.data?.message)
      errRef.current.focus()
    }
  }, [isError])

  let modalError
  if (isLoading) modalError = <PulseLoader />
  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

  const modalContent = <form className="form form--thin" onSubmit={handleSubmit}>
    {errMessage}
    <label className="form__label" htmlFor="client">
        Client Email 
      </label>
      <ClientDropdown name="client" setUser={setClient} checkUnowned={true} />
    <button name="button-submit" className="button--primary">{ isLoading ? <PulseLoader /> : 'Add' }</button>
    <button
      title="Close"
      className="button--secondary"
      onClick={handleCancel}
    >
      Cancel
    </button>
  </form>
  if (open) return <Modal content={modalContent} open={open} setOpen={setOpen}/>
  else return null
}

export default AddClientModal