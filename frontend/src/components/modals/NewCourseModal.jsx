import { useEffect, useRef, useState } from "react"
import Modal from "./Modal"
import { PulseLoader } from "react-spinners"
import { useAddNewCourseMutation } from "../../features/courses/coursesApiSlice"
import { TextField } from "@mui/material"

const NewCourseModal = ({ open, setOpen}) => {  
  const errRef = useRef()

  const [ createCourse, {
    isSuccess: isCreateSuccess,
    isLoading: isCreateLoading,
    isError: isCreateError,
    error: createError
  }] = useAddNewCourseMutation()

  const [courseName, setCourseName] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [description, setDescription] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [min, setMin] = useState()
  const [max, setMax] = useState()

  // user input
  const handleNameInput = e => setCourseName(e.target.value)
  const handleCourseCodeInput = e => setCourseCode(e.target.value)
  const handleDescriptionInput = e => setDescription(e.target.value)
  const handleSubtitleInput = e => setSubtitle(e.target.value)
  const handleMinInput = e => setMin(e.target.value)
  const handleMaxInput = e => setMax(e.target.value)
  
  const handleSubmitCreate = e => {
    e.preventDefault()
    if (min && max) createCourse({ name: courseName, courseCode: courseCode, description: description, subtitle: subtitle, minGroupSize: min, maxGroupSize: max })
    else if (max) createCourse({ name: courseName, courseCode: courseCode, description: description, subtitle: subtitle, maxGroupSize: max })
    else if (min) createCourse({ name: courseName, courseCode: courseCode, description: description, subtitle: subtitle, minGroupSize: min })
    else createCourse({ name: courseName, courseCode: courseCode, description: description, subtitle: subtitle })
  }

  const handleCancel = e => {
    setDescription('')
    setCourseName('')
    setCourseCode('')
    setSubtitle('')
    setOpen(false)
  }

  useEffect(() => {
    if (isCreateSuccess) {
      setCourseName('')
      setCourseCode('')
      setDescription('')
      setSubtitle('')
      setOpen(false)
    }
  })

  let modalError
  if (isCreateLoading) modalError = <PulseLoader />
  if (isCreateError) modalError = <p ref={errRef} className="errmsg" aria-live="assertive">{createError?.data?.message}</p>

  const modalContent = <form className="form form--thin" onSubmit={handleSubmitCreate}>
  <div>
    <TextField 
        id="name"
        label="Course Name"
        variant="outlined"
        value={courseName}
        onChange={handleNameInput}
        autoComplete="off"
        required
        margin="dense"
      />

      <TextField
        id="course-code"
        variant="outlined"
        onChange={handleCourseCodeInput}
        value={courseCode}
        autoComplete="off"
        label="Course Code"
        margin="dense"
        required
      />
    </div>

    <TextField
      id="description"
      variant="outlined"
      onChange={handleDescriptionInput}
      value={description}
      autoComplete="off"
      label="Course Description"
      multiline
      margin="dense"
      required
    />

    <TextField
      id="subtitle"
      variant="outlined"
      onChange={handleSubtitleInput}
      value={subtitle}
      autoComplete="off"
      label="Subtitle"
      margin="dense"
      multiline
      helperText="This will display in the course summary"
    />

    <div>
      <TextField
        id="min-group-size"
        variant="outlined"
        label="Minimum Group Size"
        onChange={handleMinInput}
        value={min}
        margin="dense"
        autoComplete="off"
        size="small"
        type="number"
      />

      <TextField
        id="max-group-size"
        variant="outlined"
        label="Maximum Group Size"
        onChange={handleMaxInput}
        value={max}
        margin="dense"
        autoComplete="off"
        size="small"
        type="number"
      />
    </div>

  <button name="button-submit" className="button--primary">Create</button>
  <button
        title="Close"
        className="button-secondary"
        onClick={handleCancel}
      >
        Cancel
      </button>
  </form>

  return <Modal content={modalContent} open={open} setOpen={setOpen}/>

}

export default NewCourseModal