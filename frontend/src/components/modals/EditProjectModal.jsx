import { useEffect, useRef, useState } from "react"
import Modal from "./Modal"
import { useGetAllProjectsQuery, useUpdateProjectMutation } from "../../features/projects/projectsApiSlice"
import useAuth from "../../hooks/useAuth"
import { useSelector } from "react-redux"
import { selectCurrentCourse } from "../../features/courses/courseSlice"
import { PulseLoader } from "react-spinners";
import { selectCurrentProject } from "../../features/projects/projectSlice"
import { TextField } from "@mui/material"

const EditProjectModal = ({ open, setOpen }) => {
  const errRef = useRef()
  const { userId } = useAuth()
  const courseId = useSelector(selectCurrentCourse)
  const projectId = useSelector(selectCurrentProject)

  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [maxGroups, setMaxGroups] = useState(5)
  const [errMsg, setErrMsg] = useState('')
  const [subtitle, setSubtitle] = useState('')

  const onNameChanged = e => setProjectName(e.target.value)
  const onDescChanged = e => setDescription(e.target.value)
  const onCategoryChanged = e => setCategory(e.target.value)
  const onMaxChanged = e => setMaxGroups(e.target.value)
  const onSubtitleChanged = e => setSubtitle(e.target.value)

  const { project } = useGetAllProjectsQuery("projectsList", {
    selectFromResult: ({ data }) => ({
      project: data?.entities[projectId]
    })
  })

  const [ updateProject, {
    isSuccess,
    isLoading,
    isError,
    error
  }] = useUpdateProjectMutation()

  const close = () => {
    setOpen(false)
  }
  
  const handleSubmit = e => {
    e.preventDefault()
    updateProject({
      name: projectName,
      description,
      clientId: userId,
      courseId,
      category,
      projectId,
      maxGroups,
      subtitle
    })
  }

  useEffect(() => {
    if (isError) {
      setErrMsg(error?.data?.message)
      errRef.current.focus()
    }
  })

  useEffect(() => {
    if (isSuccess) close()
  })

  useEffect(() => {
    if (project) {
      setProjectName(project.name)
      setDescription(project.description)
      setCategory(project.category)
      setMaxGroups(project.maxGroups)
      setSubtitle(project.subtitle)
    }
  }, [project])

  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <p ref={errRef} className={errClass} aria-live="assertive" >{errMsg}</p>

  const modalContent = <>
    { errMessage }
    <form className="form" onSubmit={handleSubmit}>
      <TextField
        id="project-name"
        variant="outlined"
        onChange={onNameChanged}
        value={projectName}
        autoComplete="off"
        label="Project Name"
        margin="dense"
        required
      />

      <TextField
        id="description"
        variant="outlined"
        onChange={onDescChanged}
        value={description}
        autoComplete="off"
        label="Project Description"
        multiline
        margin="dense"
        required
      />

      <TextField
        id="subtitle"
        variant="outlined"
        onChange={onSubtitleChanged}
        value={subtitle}
        autoComplete="off"
        label="Subtitle"
        margin="dense"
        multiline
        helperText="This will display in the project summary"
      />

      <TextField
        id="category"
        variant="outlined"
        onChange={onCategoryChanged}
        value={category}
        autoComplete="off"
        label="Project Category"
        multiline
        margin="dense"
        required
      />

      <TextField
        id="max-groups"
        variant="outlined"
        label="Maximum Number of Groups"
        onChange={onMaxChanged}
        value={maxGroups}
        margin="dense"
        autoComplete="off"
        size="small"
        type="number"
      />

      <button title="Submit Project" className="button--primary" name="button-submit-new-project" type="submit">
        { isLoading ? <PulseLoader /> : "Save" }
      </button>
      <button title="Close" className="button-secondary" onClick={close}>
        Cancel
      </button>
    </form>
  </>
  return <Modal content={modalContent} open={open} setOpen={setOpen} />
}

export default EditProjectModal