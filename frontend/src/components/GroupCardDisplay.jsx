import { useEffect, useRef, useState } from "react";
import {
  useAddMemberToGroupMutation,
  useChangeGroupOwnerMutation,
  useDeleteGroupMutation,
  useGetGroupsQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useRemoveMemberFromGroupMutation,
} from "../features/groups/groupsApiSlice";
import useAuth from "../hooks/useAuth";
import GroupMembersList from "./GroupMembersList";
import { PulseLoader } from "react-spinners";
import EditGroupModal from "./modals/EditGroupModal";
import { useDispatch } from "react-redux";
import { setCurrentGroup } from "../features/groups/groupSlice";
import { useNavigate } from "react-router-dom";
import GroupPreferences from "./GroupPreferences.jsx";
import AssignedProject from "./AssignedProject.jsx";
import StudentDropdownUngrouped from "./StudentDropdownUngrouped.jsx";

const GroupCardDisplay = ({ groupId }) => {
  const { userId, isCourseAdmin } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errMsg, setErrMsg] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [inGroup, setInGroup] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [userToAdd, setUserToAdd] = useState()
  const errRef = useRef();

  const { data: groups, isSuccess, isLoading, isError } = useGetGroupsQuery();

  const [
    deleteGroup,
    { isSuccess: isDeleteSuccess, isLoading: isDelLoading, error: delError },
  ] = useDeleteGroupMutation();

  const [
    changeOwner,
    {
      isSuccess: isChangeSuccess,
      error: changeError,
    },
  ] = useChangeGroupOwnerMutation();

  const [ addMember, {
    isSuccess: isAddSuccess,
    isLoading: isAddLoading,
    isError: isAddError,
    error: addError
  }] = useAddMemberToGroupMutation()

  const [
    removeMember,
    {
      isSuccess: isRemSuccess
    },
  ] = useRemoveMemberFromGroupMutation();

  const [
    leaveGroup,
    { isSuccess: isLeaveSuccess, isLoading: isLeaveLoading, error: leaveError },
  ] = useLeaveGroupMutation();

  const [
    joinGroup,
    { isSuccess: isJoinSuccess,
      isLoading: isJoinLoading,
      isError: isJoinError,
      error: joinError
    }] = useJoinGroupMutation()

  useEffect(() => {
    if (leaveError) {
      setErrMsg(leaveError?.data?.message);
      errRef.current.focus();
    }
  }, [leaveError]);

  useEffect(() => {
    if (delError) {
      setErrMsg(delError?.data?.message);
      errRef.current.focus();
    }
  }, [delError]);

  useEffect(() => {
    if (isJoinError) {
      setErrMsg(joinError?.data?.message);
      errRef.current.focus();
    }
  }, [isJoinError]);

  useEffect(() => {
    if (changeError) {
      setErrMsg(changeError?.data?.message);
      errRef.current.focus();
    }
  }, [changeError]);

  useEffect(() => {
    if (isLeaveSuccess) {
      setErrMsg("");
      navigate("/dash/groups");
    }
  }, [isLeaveSuccess]);

  useEffect(() => {
    if (isDeleteSuccess) {
      setErrMsg("");
      navigate("/dash/groups");
    }
  }, [isDeleteSuccess]);

  useEffect(() => {
    if (isJoinSuccess) {
      setErrMsg("");
      setInGroup(true)
    }
  }, [isJoinSuccess]);

  useEffect(() => {
    if (isChangeSuccess) setErrMsg("");
  }, [isChangeSuccess]);

  useEffect(() => {
    if (isRemSuccess) setErrMsg("");
  }, [isRemSuccess]);

  useEffect(() => {
    if (isSuccess && groups.entities[groupId].members.includes(userId)) setInGroup(true)
  }, [isSuccess])

  useEffect(() => {
    setErrMsg('')
  }, [editOpen])

  const handleView = () => {
    dispatch(setCurrentGroup(groupId));
    navigate('/dash/groups/view');
  };

  const handleAddMember = e => {
    e.preventDefault()
    if (showAdd) {
      if (userToAdd) addMember({ groupId, userId: userToAdd })
      else {
        setErrMsg('Please select a valid student from the dropdown')
        errRef.current.focus()
      }
    } else setShowAdd(true)
  }

  const handleCancel = () => {
    setErrMsg('')
    setShowAdd(false)
  }

  const onAddInput = (userId) => {
    setUserToAdd(userId)
    setErrMsg('')
  }

  useEffect(() => {
    if (isAddError) {
      setErrMsg(addError)
      errRef.current.focus()
    }
  }, [isAddError])

  useEffect(() => {
      if (isAddSuccess) setShowAdd(false)
  }, [isAddSuccess])

  const errClass = errMsg ? "errmsg" : "";

  let errMessage = (
    <p ref={errRef} className={errClass} aria-live="assertive">
      {errMsg}
    </p>
  );

  let assignedProject
  let projectId
  if (groups) projectId = groups.entities[groupId]?.projectAssigned
  if (projectId) assignedProject = <AssignedProject id={projectId} />

  if (isSuccess) {
    const group = groups?.entities[groupId];
    return (
      <div className={`card`} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
        <div>
          {(group?.owner === userId || isCourseAdmin) && (
            <>
              <button
                className="button--secondary"
                title="Delete"
                onClick={() => deleteGroup({ groupId: group.id })}
              >
                {isDelLoading ? <PulseLoader /> : "Delete Group"}
              </button>

              <button 
                title="Edit"
                className="button--secondary"
                onClick={() => setEditOpen(true)}>
                Edit Group
              </button>
              { inGroup && <GroupPreferences group={group}/>}
            </>
          )}

          {inGroup && (
            <button
              title="Leave"
              className="button--secondary"
              onClick={() => leaveGroup({ groupId: group.id })}
            >
              {isLeaveLoading ? <PulseLoader /> : "Leave Group"}
            </button>
          )}

          {!inGroup && !isCourseAdmin && (
            <button
              title="Join-Group"
              className="button--primary"
              onClick={() => joinGroup({ groupId: group.id })}
            >
              {isJoinLoading ? <PulseLoader /> : "Join"}
            </button>
          )}   
          { (isCourseAdmin || group?.owner === userId ) && showAdd && <StudentDropdownUngrouped setUser={onAddInput} name="New Member"/> }
        { (isCourseAdmin || group?.owner === userId ) && <button
          name="addMember"
          className="button--primary"
          onClick={handleAddMember}
          >
            { isAddLoading ? <PulseLoader /> : 'Add Member' }
        </button>}
        { (isCourseAdmin || group?.owner === userId ) && showAdd && <button
          name="cancel"
          className="button--secondary"
          onClick={handleCancel}
          >
            Cancel
        </button>}  
        </div>
        <div>
          {errMessage}
          <div className="card__header">
            <div className="card__title clickable" onClick={handleView}>
              {group.name}
            </div>
          </div>

          <div className="card__description">{group.description}</div>
          <GroupMembersList
            group={group}
            ownerOptions={group?.owner === userId || isCourseAdmin}
            makeOwnerFn={changeOwner}
            removeMemberFn={removeMember}
          />
        </div>
        { (group.members.includes(userId) || isCourseAdmin ) && assignedProject}
        <EditGroupModal open={editOpen} setOpen={setEditOpen} group={group} />
      </div>
    );
  } else if (isLoading) return <PulseLoader />;
  else if (isError) return <div>Error loading group</div>;
};
export default GroupCardDisplay;
