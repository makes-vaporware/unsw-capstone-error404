import { PulseLoader } from "react-spinners";
import GroupCard from "../../components/GroupCard";
import { useGetGroupsQuery } from "./groupsApiSlice";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import NewGroupModal from "../../components/modals/NewGroupModal";
import GroupCardDisplay from "../../components/GroupCardDisplay";
import { useSelector } from "react-redux";
import { selectCurrentCourse } from "../courses/courseSlice";
import GroupRecommendations from "../../components/GroupRecommendations";


const NOT_IN_GROUP_MSG = <div className="message"> You are not in a group </div>
const NO_GROUPS_MSG = <div className="message"> There are no groups in this course </div>

const Groups = () => {
  const courseId = useSelector(selectCurrentCourse);
  const { userId, isSiteAdmin, isCourseAdmin, isStudent } = useAuth();

  const { data, 
    isSuccess, 
    isLoading,
    isError,
    error } = useGetGroupsQuery();

  const [joinError, setJoinError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const errRef = useRef();


  useEffect(() => {
    if (joinError) {
      setErrMsg(joinError)
      errRef.current.focus()
    } else setErrMsg('')
  }, [joinError])

  // content to display
  let groupsList;
  let inGroup = false;
  let myGroupContent;
  if (isSuccess) {
    const { ids, entities } = data;
    const courseGroupIdsRaw =
      ids.length && ids.filter((id) => entities[id]?.courseId === courseId); // check that the group is for this course
    const courseGroupIds =
      courseGroupIdsRaw.length &&
      courseGroupIdsRaw.filter((id) => {
        return (
          !entities[id]?.isPrivate ||
          entities[id]?.members.includes(userId) ||
          isSiteAdmin ||
          isCourseAdmin
        );
      }); // check permissions

    // get own group
    const myGroupId =
      courseGroupIds.length &&
      courseGroupIds.find((id) => entities[id]?.members?.includes(userId));
    
    if (myGroupId) {
      myGroupContent = <GroupCardDisplay groupId={myGroupId} />;
      inGroup = true;
    } else if (!isCourseAdmin) {
      myGroupContent = NOT_IN_GROUP_MSG;
    }

    // display all groups
    if (courseGroupIds.length) {
      groupsList =
      courseGroupIds.map((id) => {
        return (
          <GroupCard
            key={id}
            group={entities[id]}
            canJoin={!inGroup && !isCourseAdmin}
            setError={setJoinError}
          />
        )
      })
      groupsList.reverse()
    } else groupsList = NO_GROUPS_MSG

  } else if (isLoading) {
    myGroupContent = <PulseLoader />
    groupsList = <PulseLoader />
  } else if (error?.data?.message === "No groups found") {
    myGroupContent = NOT_IN_GROUP_MSG
    groupsList = NO_GROUPS_MSG
  } else if (isError) {
    myGroupContent, groupsList = <div> Error loading groups </div>
  }
  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

  // format content
  const groupsContent = (
    <div className="card__display-box">
      <div>
        <h2>All Groups</h2>
      </div>
      <div className="card__container">{groupsList}</div>
    </div>
  )
  const groupRecsContent = <GroupRecommendations/>

  const studentInfo = <div className="manual">Here you can join a public group below, or create your own! To form a group with your friends, create a private group and add your friends</div>
  const adminInfo = <div className="manual">Here you can see all groups, or create news ones with a designed student owner! To see a group's details and add or remove members, click on the group</div>
  return (
    <div className="page">
      <div className="page-title">Groups</div>
      {myGroupContent}
      {(!inGroup || isCourseAdmin) && (
        <button className="button--primary" title="Create Group" onClick={() => setModalOpen(true)}>
          New Group
        </button>
      )}
      { errMessage }
      { isStudent && studentInfo }
      { (isCourseAdmin || isSiteAdmin) && adminInfo}
      <NewGroupModal open={modalOpen} setOpen={setModalOpen} />
      {!inGroup && isStudent && groupRecsContent}
      {groupsContent}
    </div>
  );
};

export default Groups;