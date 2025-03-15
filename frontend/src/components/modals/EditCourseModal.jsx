import { useEffect, useRef, useState } from "react"
import Modal from "./Modal"
import { PulseLoader } from "react-spinners"
import { useEditCourseMutation, useGetCoursesQuery } from "../../features/courses/coursesApiSlice"
import { useSelector } from "react-redux"
import { selectCurrentCourse } from "../../features/courses/courseSlice"
import { TextField } from "@mui/material"

const EditCourseModal = ({ open, setOpen }) => {  
  const errRef = useRef()
  const courseId = useSelector(selectCurrentCourse)

  const { course } = useGetCoursesQuery("coursesList", {
    selectFromResult: ({ data }) => ({
      course: data?.entities[courseId],
    }),
  });

  const [ editCourse, {
    isSuccess,
    isLoading,
    isError,
    error
  }] = useEditCourseMutation()

  const [courseName, setCourseName] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [description, setDescription] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [studentJoinCode, setStudentJoinCode] = useState('')
  const [academicJoinCode, setAcademicJoinCode] = useState('')
  const [adminJoinCode, setAdminJoinCode] = useState('')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (course) {
      setCourseCode(course.courseCode)
      setCourseName(course.name)
      setDescription(course.description)
      setSubtitle(course.subtitle ? course.subtitle: '')
      setMax(course.maxGroupSize)
      setMin(course.minGroupSize)
      setStudentJoinCode(course.studentJoinCode)
      setAcademicJoinCode(course.academicJoinCode)
      setAdminJoinCode(course.adminJoinCode)
    }
  }, [course])

  // user input
  const handleNameInput = e => setCourseName(e.target.value)
  const handleCourseCodeInput = e => setCourseCode(e.target.value)
  const handleDescriptionInput = e => setDescription(e.target.value)
  const handleSubtitleInput = e => setSubtitle(e.target.value)
  const handleMinInput = e => setMin(e.target.value)
  const handleMaxInput = e => setMax(e.target.value)
  const handleStuCodeInput = e => setStudentJoinCode(e.target.value)
  const handleAcaCodeInput = e => setAcademicJoinCode(e.target.value)
  const handleAdmCodeInput = e => setAdminJoinCode(e.target.value)
  
  const handleSubmitEdit = e => {
    e.preventDefault()
    let requestParams = { 
      courseId: course.id,
      name: courseName, 
      courseCode: courseCode, 
      description: description,
      subtitle: subtitle,
      studentJoinCode: studentJoinCode,
      academicJoinCode: academicJoinCode,
      adminJoinCode: adminJoinCode
    }
    if (max) requestParams.max = max
    if (min) requestParams.min = min
    editCourse(requestParams)
  }

  const handleCancel = e => {
    setDescription('')
    setSubtitle('')
    setCourseName('')
    setCourseCode('')
    setOpen(false)
  }

  useEffect(() => {
    if (isSuccess) {
      setCourseName('')
      setCourseCode('')
      setDescription('')
      setSubtitle('')
      setOpen(false)
    }
  }, [isSuccess])

  useEffect(() => {
    if (isError) {
      setErrMsg(error?.data?.message)
      errRef.current.focus()
    }
  }, [isError])

  const errClass = errMsg ? "errmsg" : "offscreen"
  let modalError
  if (isLoading) modalError = <PulseLoader />
  if (errMsg) modalError = <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

  const modalContent = <form className="form form--thin" onSubmit={handleSubmitEdit}>
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
        id="student-join-code"
        variant="outlined"
        label="Student Join Code"
        onChange={handleStuCodeInput}
        value={studentJoinCode}
        margin="dense"
        autoComplete="off"
        size="small"
      />

      <TextField
        id="admin-join-code"
        variant="outlined"
        label="Academic Join Code"
        onChange={handleAcaCodeInput}
        value={academicJoinCode}
        margin="dense"
        autoComplete="off"
        size="small"
      />

      <TextField
        id="admin-join-code"
        variant="outlined"
        label="Admin Join Code"
        onChange={handleAdmCodeInput}
        value={adminJoinCode}
        margin="dense"
        autoComplete="off"
        size="small"
      />
    </div>

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

    <button name="button-submit" className="button--primary">Save</button>
    <button
      title="Close"
      className="button--secondary"
      onClick={handleCancel}
    >
      Cancel
    </button>
  </form>

  return <Modal content={modalContent} open={open} setOpen={setOpen}/>

}

export default EditCourseModal