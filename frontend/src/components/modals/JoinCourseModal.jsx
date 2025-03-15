import { useEffect, useRef, useState } from "react"
import Modal from "./Modal"
import { PulseLoader } from "react-spinners"
import { useJoinCourseMutation } from "../../features/courses/coursesApiSlice"
import { TextField } from "@mui/material"

const JoinCourseModal = ({ open, setOpen, courseId}) => {  
  const errRef = useRef()

  const [ joinCourse, {
    isSuccess,
    isLoading,
    isError,
    error
  }] = useJoinCourseMutation()

  const [code, setCode] = useState('')

  // user input
  const handleCodeInput = e => setCode(e.target.value)
  
  const handleSubmit = e => {
    e.preventDefault()
    joinCourse({ courseId: courseId, joinCode: code })
  }
  const handleCancel = e => {
    setCode('')
    setOpen(false)
  }

  useEffect(() => {
    if (isSuccess) {
      setCode('')
      setOpen(false)
    }
  }, [isSuccess])

  let modalError
  if (isLoading) modalError = <PulseLoader />
  if (isError) modalError = <p ref={errRef} className="errmsg" aria-live="assertive">{error?.data?.message}</p>

  const modalContent = <form className="form form--thin" onSubmit={handleSubmit}>
    <TextField
        id="code"
        variant="outlined"
        onChange={handleCodeInput}
        value={code}
        autoComplete="off"
        label="Join Code"
        multiline
        margin="dense"
        required
      />
    <button name="button-submit" className="button--primary">Join</button>
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

export default JoinCourseModal