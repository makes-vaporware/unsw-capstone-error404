import { PulseLoader } from "react-spinners";
import { useDeleteCourseMutation, useEditCourseMutation, useGetCoursesQuery, useGetMatchingSuggestionsQuery, useLeaveCourseMutation } from "./coursesApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentCourse } from "./courseSlice";
import useAuth from "../../hooks/useAuth";
import { useGetUsersQuery } from "../users/usersApiSlice";
import EditCourseModal from "../../components/modals/EditCourseModal";
import { useEffect, useRef, useState } from "react";
import UserCardCourseAdmin from "../../components/UserCardCourseAdmin";
import { useGetGroupsQuery } from "../groups/groupsApiSlice";
import ProjectRecommendations from "../../components/ProjectRecommendations";
import GroupRecommendations from "../../components/GroupRecommendations";
import { TextField, Tooltip } from "@mui/material";
import SeeMatchingsButton from "../../components/modals/SeeMatchingsButton";
import AssignedProject from "../../components/AssignedProject";
import { useGetAllProjectsQuery } from "../projects/projectsApiSlice";
import MatchingCard from "../../components/MatchingCard";

const CourseDash = () => {
  const courseId = useSelector(selectCurrentCourse);
  const errRef = useRef()
  
  const { isCourseAdmin, isSiteAdmin, userId, isStudent, isAcademic } = useAuth()

  const [modalOpen, setModalOpen] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [groupId, setGroupId] = useState()
  const [editStudentAccess, setEditStudentAccess] = useState(false)
  const [editAdminAccess, setEditAdminAccess] = useState(false)
  const [editAcademicAccess, setEditAcademicAccess] = useState(false)
  const [newAdminCode, setNewAdminCode] = useState('')
  const [newAcademicCode, setNewAcademicCode] = useState('')
  const [newStudentCode, setNewStudentCode] = useState('')

  const { course } = useGetCoursesQuery("coursesList", {
    selectFromResult: ({ data }) => ({
      course: data?.entities[courseId],
    }),
  })

  const {
    data,
    isSuccess: isGetSuccess,
    isLoading: isGetLoading,
    isError: isGetError
  } = useGetUsersQuery()

  const [ deleteCourse, {
    isLoading: isDelLoading,
    isError: isDelError,
    error: delError
  }] = useDeleteCourseMutation()

  const [ leaveCourse, {
    isLoading: isLeaveLoading,
    isError: isLeaveError,
    error: leaveError
  }] = useLeaveCourseMutation()

  const [ updateCode, {
    isSuccess: isEditSuccess,
    isLoading: isEditLoading,
    isError: isEditError,
    error: editError
  }] = useEditCourseMutation()

  const {
    data: groupData,
    isSuccess: isGroupsSuccess,
    isLoading: isGroupsLoading,
    isError: isGroupsError
  } = useGetGroupsQuery()

  const {
    data: projectsData,
    isSuccess: isGetProjectsSuccess
  } = useGetAllProjectsQuery()


        
  const openModal = e => {
    e.preventDefault()
    setModalOpen(true)
  }

  useEffect(() => {
    if (isGroupsSuccess) {
      // find user's group
      const id = groupData.ids.filter(id => groupData.entities[id].courseId === courseId)
        .find(id => groupData.entities[id].members.includes(userId))
      if (id) setGroupId(id)
      else setGroupId(null)
    }
  }, [isGroupsSuccess])

  useEffect(() => {
    if (isDelError) {
      setErrMsg(delError?.data?.message)
      errRef.current.focus()
    }
  }, [isDelError])

  useEffect(() => {
    if (isLeaveError) {
      setErrMsg(leaveError?.data?.message)
      errRef.current.focus()
    }
  }, [isLeaveError])

  useEffect(() => {
    if (isEditError) {
      setErrMsg(editError?.data?.message)
      errRef.current.focus()
    }
  })

  useEffect(() => {
    if (course) {
      setNewAcademicCode(course.academicJoinCode)
      setNewAdminCode(course.adminJoinCode)
      setNewStudentCode(course.studentJoinCode)
    }
  }, [course])

  useEffect(() => {
    if (isEditSuccess) {
      setErrMsg('')
      setEditAcademicAccess(false)
      setEditAdminAccess(false)
      setEditStudentAccess(false)
    }
  }, [isEditSuccess])

  const onAdminCodeChanged = e => setNewAdminCode(e.target.value)
  const onAcademicCodeChanged = e => setNewAcademicCode(e.target.value)
  const onStudentCodeChanged = e => setNewStudentCode(e.target.value)

  const openAdmin = () => {
    setEditAdminAccess(true)
    setEditAcademicAccess(false)
    setEditStudentAccess(false)
  }

  const openAcademic = () => {
    setEditAdminAccess(false)
    setEditAcademicAccess(true)
    setEditStudentAccess(false)
  }

  const openStudent = () => {
    setEditAdminAccess(false)
    setEditAcademicAccess(false)
    setEditStudentAccess(true)
  }
  const saveAdminCode = () => {
    if (newAdminCode !== course.adminJoinCode) updateCode({ adminJoinCode: newAdminCode, courseId })
    else setEditAdminAccess(false)
  }
  const saveAcademicCode = () => {
    if (newAcademicCode !== course.academicJoinCode) updateCode({ academicJoinCode: newAcademicCode, courseId })
    else setEditAcademicAccess(false)
  }
  const saveStudentCode = () => {
    if (newStudentCode !== course.studentJoinCode) updateCode({ studentJoinCode: newStudentCode, courseId })
    else setEditStudentAccess(false)
  }

  let usersContent
  if (isGetSuccess) {
    usersContent = 
    <div className="card__display-box">
      <h4>Users</h4>
      <div className="card__scroll-display-box ">
        { course.users.map((user, key) => {
          return <UserCardCourseAdmin user={data.entities[user.userid]} course={course} key={key} />
        })}
      </div>
    </div>
  } else if (isGetLoading) usersContent = <PulseLoader />
  else if (isGetError) usersContent = <div> Error loading users </div>

  const joinCodeInfo = <div className="manual">Give these join codes to the users you wish to join your course. You might like to change these codes for security, by clicking above, or through course edit. Each type of user has their own code, so make sure you give them the right one!</div>
  const joinCodes = <div style={{display: 'flex', width: '550px', columnGap: '10px', margin: 'auto'}}>
    <div>
      <h4>Join Codes</h4>
      <div>
        
        Admin: {' '}
        <Tooltip title="click to edit">
          { !editAdminAccess && <span className="clickable" onClick={openAdmin}>{ course.adminJoinCode }</span> }
          </Tooltip>
        { editAdminAccess && <TextField 
            id="outlined-basic" 
            label="Admin Code" 
            variant="outlined" 
            value={newAdminCode} 
            size="small"
            onChange={onAdminCodeChanged}
          />}
        { editAdminAccess && <button className="button--secondary" onClick={saveAdminCode}>{ isEditLoading ? <PulseLoader /> : 'set' }</button> }
      </div>
      <div>
        Academic: {' '}
        <Tooltip title="click to edit">
          { !editAcademicAccess && <span className="clickable" onClick={openAcademic}>{ course.academicJoinCode }</span> }
        </Tooltip>
        { editAcademicAccess && <TextField 
            id="outlined-basic" 
            label="Academic Code" 
            variant="outlined" 
            value={newAcademicCode} 
            size="small"
            onChange={onAcademicCodeChanged}
          />}
        { editAcademicAccess && <button className="button--secondary" onClick={saveAcademicCode}>{ isEditLoading ? <PulseLoader /> : 'set' }</button> }
      </div>
      <div>
        Student: {' '}
        <Tooltip title="click to edit">
          { !editStudentAccess && <span className="clickable" onClick={openStudent}>{ course.studentJoinCode }</span> }
        </Tooltip>
        { editStudentAccess && <TextField 
            id="outlined-basic" 
            label="Student Code" 
            variant="outlined" 
            value={newStudentCode} 
            size="small"
            onChange={onStudentCodeChanged}
          />}
        { editStudentAccess && <button className="button--secondary" onClick={saveStudentCode}>{ isEditLoading ? <PulseLoader /> : 'set' }</button> }
      </div>
    </div>
    { isCourseAdmin && joinCodeInfo }
  </div>

  const editButton = <button 
    name="edit course"
    className="button--secondary"
    onClick={openModal}
  >
    Edit Course
  </button>

  const deleteButton = <button 
    name="delete course"
    className="button--secondary"
    onClick={() => deleteCourse({ courseId: courseId })}
  >
    { isDelLoading ? <PulseLoader /> : 'Delete Course'} 
  </button>

  const leaveButton = <button 
    name="leave course"
    className="button--secondary"
    onClick={() => leaveCourse({ courseId: courseId })}
    >
      { isLeaveLoading ? <PulseLoader /> : 'Leave Course'} 
  </button>

  let assignedProject
  let projectId
  if (groupData) projectId = groupData.entities[groupId]?.projectAssigned
  if (projectId) assignedProject = <AssignedProject id={projectId} />

  const projectRecs = groupId ? <ProjectRecommendations groupId={groupId} limit={6}/> : <h4> Join a group to see recommended projects </h4> 

  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <><p ref={errRef} className={errClass} aria-live="assertive" > {errMsg} </p> <br/></>

  //showing groups:
  let groupsContent;
  if (isGroupsSuccess && isGetProjectsSuccess) {
    groupsContent = groupData.ids
    .filter(id => groupData.entities[id].courseId === courseId )
    .map((groupId, i) => {
      return (
        <div key={i} className='card'>
          <MatchingCard matchObject={{groupId: groupId}} allProjects={projectsData.entities} allGroups={groupData.entities}/>
        </div>
      )
    })
  } else {
    groupsContent = <PulseLoader/>
  }
  const groupsBox = <div className="card__display-box">
    <h4>Groups</h4>
    <SeeMatchingsButton courseId={courseId}/>
    <div className="card__scroll-display-box">
      {groupsContent}
    </div>
  </div>
  
  const studentInfo = <div className="manual">This is where you can see your course info! Scroll down to see recommended groups and projects, or use the buttons in the header to browse them.</div>
  const academicInfo = <div className="manual">To create a project, click the button in the header!</div>
  const adminInfo = <div className="manual">This is your course home page! Scroll down to edit your course, to edit user privileges or to generate group to project matching. You can also browse groups and projects using the buttons in the header</div>

  if (course) {
    return (
      <div className="page">
        <div className="page-title">{course.name}</div>
        <div>
          {course.courseCode} 
          { isCourseAdmin && " - admin"} 
          { isAcademic && " - academic" } 
          { isStudent && " - student" }
        </div>
        { errMessage }

        <em>{course.subtitle}</em> 
        <br/><br/>
        { isStudent && studentInfo }
        { isAcademic && academicInfo }
        { (isCourseAdmin || isSiteAdmin) && adminInfo}
        <br/>
        <pre className="course-description">{course.description}</pre>

        { (isCourseAdmin || isSiteAdmin) && editButton }
        { (isCourseAdmin || isSiteAdmin) && deleteButton}
        { leaveButton }
        { (isCourseAdmin || isSiteAdmin) && joinCodes}
        { (isCourseAdmin || isSiteAdmin) && usersContent}
        { (isCourseAdmin || isSiteAdmin) && groupsBox}
        <EditCourseModal 
          open={modalOpen} 
          setOpen={setModalOpen}
          course={course} />
        { projectId && assignedProject }
        { isStudent && !projectId && projectRecs }
        { !groupId && isStudent && <GroupRecommendations />}
      </div>
    );
  } else return <PulseLoader />;
};

export default CourseDash;

