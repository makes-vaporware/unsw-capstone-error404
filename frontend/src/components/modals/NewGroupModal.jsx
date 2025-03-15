import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { useNewGroupMutation } from "../../features/groups/groupsApiSlice";
import { PulseLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth";
import { selectCurrentCourse } from "../../features/courses/courseSlice";
import { useSelector } from "react-redux";
import StudentDropdownUngrouped from "../StudentDropdownUngrouped";
import { FormControlLabel, Switch, TextField } from "@mui/material";

const NewGroupModal = ({ open, setOpen }) => {
  const errRef = useRef();
  const courseId = useSelector(selectCurrentCourse);
  const { userId, isCourseAdmin } = useAuth();

  const [
    newGroup,
    {
      isSuccess: isNewSuccess,
      isLoading: isNewLoading,
      isError: isNewError,
      error: newError,
    },
  ] = useNewGroupMutation();

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [ownerId, setOwnerId] = useState('')
  const [errMsg, setErrMsg] = useState('')

  // user input
  const onNameChanged = e => setNewGroupName(e.target.value)
  const onDescChanged = e => setNewGroupDesc(e.target.value)
  const onPrivateChanged = e => setIsPrivate(e.target.checked)
  
  const handleCreate = e => {
    e.preventDefault()
    if (!isCourseAdmin) {
      newGroup({ 
        name: newGroupName, 
        description: newGroupDesc, 
        isPrivate: isPrivate, 
        courseId, 
        ownerId: userId })
    } else if (!ownerId) setErrMsg('Please select a valid student')
    else {
      newGroup({ 
        name: newGroupName, 
        description: newGroupDesc, 
        isPrivate: isPrivate, 
        courseId, 
        ownerId })
    }
  }

  const handleCancel = (e) => {
    setNewGroupDesc("");
    setNewGroupName("");
    setIsPrivate(false);
    setOpen(false);
  };

  // new group response
  useEffect(() => {
    if (isNewSuccess) {
      setNewGroupDesc("");
      setNewGroupName("");
      setIsPrivate(false);
      setOpen(false);
    }
  }, [isNewSuccess]);


  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <p ref={errRef} className={errClass} aria-live="assertive"> {errMsg}</p>

  let modalError;
  if (isNewLoading) modalError = <PulseLoader />;
  if (isNewError)
    modalError = (
      <p ref={errRef} className="errmsg" aria-live="assertive">
        {newError?.data?.message}
      </p>
    );

  const modalContent = <>
    { modalError }
    { errMessage }
    <form className="form" onSubmit={handleCreate}>
    <TextField
        id="name"
        variant="outlined"
        onChange={onNameChanged}
        value={newGroupName}
        autoComplete="off"
        label="Group Name"
        margin="dense"
        required
      />

      <TextField
        id="description"
        variant="outlined"
        onChange={onDescChanged}
        value={newGroupDesc}
        autoComplete="off"
        label="Group Description"
        multiline
        margin="dense"
        required
      />

      <FormControlLabel control={<Switch
        onChange={onPrivateChanged}
        checked={isPrivate}
      />} label="Private" />

      { isCourseAdmin && <>
        <label className="form__label" htmlFor="groupOwner">
          Group Owner: 
        </label>
        <StudentDropdownUngrouped name="owner" setUser={setOwnerId} />
      </>}

        <button title="Submit Group" className="button--primary" name="button-submit" type="submit">
          Create
        </button>
        <button title="Close" className="button--secondary" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </>

  return <Modal content={modalContent} open={open} setOpen={setOpen} />;
};

export default NewGroupModal;
