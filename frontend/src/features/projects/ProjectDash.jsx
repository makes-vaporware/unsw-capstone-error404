import { useSelector } from "react-redux"
import { selectCurrentProject } from "./projectSlice"
import { useDeleteProjectMutation, useGetAllProjectsQuery, useLeaveProjectMutation, useRemoveClientFromProjectMutation, useUpdateProjectMutation } from "./projectsApiSlice"
import { PulseLoader } from "react-spinners"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useEffect, useRef, useState } from "react"
import useAuth from "../../hooks/useAuth"
import EditProjectModal from "../../components/modals/EditProjectModal"
import AddClientModal from "../../components/modals/AddClientModal"
import { useNavigate } from "react-router-dom"
import SkillsDropdownProjects from "../../components/SkillsDropdownProjects"
import SkillsGapProjGroup from "../../components/SkillsGapProjGroup"
import { selectCurrentCourse } from "../courses/courseSlice"
import { useGetGroupsQuery } from "../groups/groupsApiSlice"
import GroupMembersList from "../../components/GroupMembersList"
import ClientStr from "../../components/ClientStr"

const ProjectDash = () => {
  const projectId = useSelector(selectCurrentProject)
  const courseId = useSelector(selectCurrentCourse)

  const { userId, isCourseAdmin, isAcademic } = useAuth()

  const errRef = useRef()
  const navigate = useNavigate()

  const { project } = useGetAllProjectsQuery("projectsList", {
    selectFromResult: ({ data }) => ({
      project: data?.entities[projectId]
    })
  })

  const {
    data: groups,
    isSuccess: isGroupsSuccess
  } = useGetGroupsQuery()

  const {
    data,
    isSuccess: isUsersSuccess,
  } = useGetUsersQuery()

  const [ deleteProject, {
    isSuccess: isDelSuccess,
    isLoading: isDelLoading,
    isError: isDelError,
    error: delError
  }] = useDeleteProjectMutation()

  const [ leaveProject, {
    isSuccess: isLeaveSuccess,
    isLoading: isLeaveLoading,
    isError: isLeaveError,
    error: leaveError
  }] = useLeaveProjectMutation()

  const [ removeClient, {
    isSuccess: isRemoveClientSuccess,
    isLoading: isRemoveClientLoading,
    isError: isRemoveClientError,
    error: removeClientError
  }] = useRemoveClientFromProjectMutation()

  const [errMsg, setErrMsg] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [showAddClient, setShowAddClient] = useState(false)
  const [groupId, setGroupId] = useState()
  const [showMatching, setShowMatching] = useState(false)

  const handleDelete = e => {
    e.preventDefault()
    deleteProject({projectId})
  }

  const handleLeave = e => {
    e.preventDefault()
    leaveProject({ projectId })
  }

  useEffect(() =>{
    if (isDelSuccess) {
      setErrMsg('')
      navigate('/dash/projects')
    }
  }, [isDelSuccess])

  useEffect(() => {
    if (isDelError) {
      setErrMsg(delError?.data?.message)
      errRef.current.focus()
    }
  })

  useEffect(() => {
    if (isLeaveSuccess) {
      setErrMsg('')
    }
  }, [isLeaveSuccess])

  useEffect(() => {
    if (isLeaveError) {
      setErrMsg(leaveError?.data?.message)
      errRef.current.focus()
    }
  }, [isLeaveError])

  useEffect(() => {
    if (isGroupsSuccess) {
      setGroupId(groups.ids.filter(id => groups.entities[id].courseId === courseId).find(id => groups.entities[id].members.includes(userId)))
    }
  }, [isGroupsSuccess])

  useEffect(() => {
    if (isRemoveClientError) {
      setErrMsg(removeClientError?.data?.message)
      errRef.current.focus()
    }
  }, [isRemoveClientError])

  useEffect(() => {
    if (isRemoveClientSuccess) setErrMsg('')
  }, [isRemoveClientSuccess])

  useEffect(() => {
    if (!showEdit) setErrMsg('')
  }, [showEdit])

  useEffect(() => {
    if (!showAddClient) setErrMsg('')
  }, [showAddClient])


  useEffect(() => {
    if (project?.groupsAssigned?.length) {
      setShowMatching(true)
    } else (setShowMatching(false))
  }, [project])

  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <p className={errClass} ref={errRef} aria-live="assertive">{errMsg}</p>

  let pageContent
  if (project) {
    const editButton = <button
      name="button-open-edit-project"
      className="button--secondary"
      onClick={() => setShowEdit(!showEdit)}
      >
        Edit Project
      </button>

    const addClientButton = <button
      name="button-open-add-client"
      className="button--secondary"
      onClick={() => setShowAddClient(!showAddClient)}
      >
        Add Client
      </button>

    const deleteButton = <button
      name="button-delete-project"
      className="button--secondary"
      onClick={handleDelete}>
      { isDelLoading ? <PulseLoader /> : 'Delete' }
    </button>

    const leaveButton = <button
      name="button-leave-project"
      className="button--secondary"
      onClick={handleLeave}>
        { isLeaveLoading ? <PulseLoader /> : 'Leave Project' }
    </button>

    //clients + remove clients:
    const removeClientById = (clientId) => {
      removeClient({projectId , clientId })
    }
    const clientsBox = 
    <div className="card__display-box">
      <div>
        <span style={{ fontSize: "1.7em", fontWeight: '550', marginTop: '15px'}}>Clients</span>
        { (project.clients.includes(userId) || isCourseAdmin ) && addClientButton }
      </div>
      {project.clients.map(clientId => {
      return (<div key={clientId} className="card">
        {data.entities[clientId].name} - { data.entities[clientId].email }
        {(project.clients.includes(userId) || isCourseAdmin) && <button className="button--secondary" onClick={() => removeClientById(clientId)}>remove</button>}
      </div>)
      })}
    </div>

    const assignedGroupsList = project.groupsAssigned.map(id => {
      return <div className="card" key={id} >
        {groups.entities[id].name}
        <GroupMembersList group={groups.entities[id]} />
        <SkillsGapProjGroup projectId={projectId} groupId={id} />
      </div>
    })

    const assignedGroups = <div className="card__display-box">
      Assigned Groups
      <div className="card__container" style={{ justifyContent: "space-evenly"}}>
        { assignedGroupsList }
      </div>
    </div>

    const academicInfo = <div className="manual">This is where you can see and edit your project! Scroll down to add required skills, or add or remove other clients to this project.</div>
    const adminInfo = <div className="manual">This is where you can see or edit a project. Scroll down to add required skills, or add or remove project clients. </div>
    pageContent = <>
      <div className="page-title">{project.name}</div>
      <div>{project.category} {'  -  '} <ClientStr ids={project.clients} /> { '  -  '}
      { project.maxGroups && project.maxGroups !== 9999 && <span>Max Groups: { project.maxGroups } </span>}</div>
      { errMessage }
      <em>{project.subtitle}</em> 
      <br/><br/>
      { isAcademic && academicInfo}
      { isCourseAdmin && adminInfo } <br/>
      <pre className="course-description">{project.description}</pre>
      {/* buttons */}
      { (project.clients.includes(userId) || isCourseAdmin ) && editButton }
      { project.clients.includes(userId) && leaveButton }
      { (project.clients.includes(userId) || isCourseAdmin ) && deleteButton } <br/>
      { showEdit && <EditProjectModal open={showEdit} setOpen={setShowEdit} /> }
      { showAddClient && <AddClientModal open={showAddClient} setOpen={setShowAddClient} /> }
      {/* skills and groups */}
      { (!showMatching || !project.clients.includes(userId)) && <SkillsGapProjGroup projectId={projectId} groupId={groupId} />}
      { (project.clients.includes(userId) || isCourseAdmin ) && !showMatching && <SkillsDropdownProjects project={project}/>}
      { (project.clients.includes(userId) || isCourseAdmin ) && showMatching && assignedGroups }
      {clientsBox}
    </>
  } else pageContent = <PulseLoader />

  return <div className="page" >{pageContent}</div>
}

export default ProjectDash