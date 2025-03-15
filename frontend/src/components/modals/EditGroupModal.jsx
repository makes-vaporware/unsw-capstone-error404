import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { useEditGroupMutation } from "../../features/groups/groupsApiSlice";
import { PulseLoader } from "react-spinners";
import { FormControlLabel, Switch, TextField } from "@mui/material";


const EditGroupModal = ({ open, setOpen, group }) => {
  const errRef = useRef();

  const [
    editGroup, {
      isSuccess: isEditSuccess,
      isLoading: isEditLoading,
      isError: isEditError,
      error: editError
    }] = useEditGroupMutation()

  const [groupName, setGroupName] = useState(group.name)
  const [groupDesc, setGroupDesc] = useState(group.description)
  const [isPrivate, setIsPrivate] = useState(group.isPrivate)
  const [errMsg, setErrMsg] = useState('')

  // user input
  const onNameChanged = e => setGroupName(e.target.value)
  const onDescChanged = e => setGroupDesc(e.target.value)
  const onPrivateChanged = e => setIsPrivate(e.target.checked)
  
  const handleEdit = e => {
    e.preventDefault()
    editGroup({ 
      name: groupName, 
      description: groupDesc, 
      isPrivate: isPrivate, 
      groupId: group.id })
  }

  // new group response
  useEffect(() => {
    if (isEditSuccess) {
      setOpen(false)
    }
  }, [isEditSuccess]);

  useEffect(() => {
    if (isEditError) {
      setErrMsg(editError?.data?.message)
      errRef.current.focus()
    }
  })

  const errClass = errMsg ? "errmsg" : "offscreen"
  const errMessage = <p className={errClass} ref={errRef} aria-live="assertive">{errMsg}</p>

  const modalContent = <>
    { errMessage }
    <form className="form" onSubmit={handleEdit}>
      <TextField
        id="name"
        variant="outlined"
        onChange={onNameChanged}
        value={groupName}
        autoComplete="off"
        label="Group Name"
        margin="dense"
        required
      />

      <TextField
        id="description"
        variant="outlined"
        onChange={onDescChanged}
        value={groupDesc}
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

      <button title="Submit Group" name="button-submit" className="button--primary" type="submit">
        { isEditLoading ? <PulseLoader /> : "Save" }
      </button>
      <button title="Close" className="button--secondary" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  </>

  return <Modal content={modalContent} open={open} setOpen={setOpen} />;
};

export default EditGroupModal;
