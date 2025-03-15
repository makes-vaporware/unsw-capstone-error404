import { useState, useEffect, useRef } from "react"
import { useEditProfileMutation, useDeleteUserMutation } from "./usersApiSlice"
import { useNavigate } from "react-router-dom"
import { PulseLoader } from "react-spinners"
import useAuth from "../../hooks/useAuth"
import { TextField } from "@mui/material"

const EMAIL_REGEX = /^[A-z0-9]+@[A-z0-9]+.edu.au/

const EditUserForm = ({ user }) => {
  const [editProfile, {
    isLoading: isEditLoading,
    isSuccess: isEditSuccess,
    isError: isEditError,
    error: editError
  }] = useEditProfileMutation()
  
  const [deleteUser, {
    isSuccess: isDelSuccess,
    isLoading: isDelLoading,
    isError: isDelError,
    error: delError
  }] = useDeleteUserMutation()

  const navigate = useNavigate()
  const errRef = useRef()
  const nameRef = useRef()
  const { userId } = useAuth()

  const [name, setName] = useState(user.name)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState(user.email)
  const [validEmail, setValidEmail] = useState(true)
  const [university, setUniversity] = useState(user.university)
  const [errMsg, setErrMsg] = useState('')
  const [cnfPassword, setCnfPassword] = useState('')
  const [match, setMatch] = useState(true)

  const onNameChanged = e => setName(e.target.value)
  const onPasswordChanged = e => setPassword(e.target.value)
  const onEmailChanged = e => setEmail(e.target.value)
  const onUniversityChanged = e => setUniversity(e.target.value)
  const onCnfPasswordChanged = e => setCnfPassword(e.target.value)

  const onSaveUserClicked = async (e) => {
    if (!email.match(EMAIL_REGEX)) setValidEmail(false)
    else if (password !== cnfPassword) setMatch(false)
    else {
      setValidEmail(true)
      setMatch(true)
      if (password) {
        await editProfile({name, email, university, password, userId })
      } else {
        await editProfile({name, email, university, userId })
      }
    }
  }

  const onDeleteUserClicked = async () => {
    await deleteUser({ id: user.id })
  }

  const reset = () => {
    setName('')
    setPassword('')
    setEmail('')
    setUniversity('')
    setErrMsg('')
    navigate('/dash/profile')
  }
  useEffect(() => {
    if (isEditSuccess) reset()
  }, [isEditSuccess, navigate])

  useEffect(() => {
    if (isDelSuccess) reset()
  }, [isDelSuccess, navigate])

  useEffect(() => {
    if (isEditError) {
      setErrMsg(editError?.data?.message)
      errRef.current.focus()
    }
  }, [isEditError])

  useEffect(() => {
    if (isDelError) {
      setErrMsg(delError?.data?.message)
      errRef.current.focus()
    }
  }, [isDelError])

  useEffect(() => {
    if (!cnfPassword) setMatch(true)
    else setMatch(password === cnfPassword)
  }, [password, cnfPassword])

  const errClass = errMsg ? "errmsg" : "offscreen"

  const content = (
    <>
      <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>
      <form className="form" onSubmit={e => e.preventDefault()}>
        <div className="form__title-row">
          <h2>Edit User</h2>
          <div className="form__action-buttoms">
            <button
              className="button--primary"
              title="Save"
              onClick={onSaveUserClicked}
            >
              { isEditLoading ? <PulseLoader /> : "Save" }
            </button>
            <button
              className="button-secondary"
              title="Delete"
              onClick={onDeleteUserClicked}
            >
              { isDelLoading ? <PulseLoader /> : "Delete" }
            </button> 
          </div>
        </div>
          <TextField
          id="name"
          ref={nameRef}
          variant="outlined"
          onChange={onNameChanged}
          value={name}
          autoComplete="off"
          label="Name"
          margin="dense"
          required
        />
        <TextField
          id="email"
          variant="outlined"
          onChange={onEmailChanged}
          error={!validEmail}
          helperText={validEmail ? "" : "Please use an education email address"}
          value={email}
          ref={nameRef}
          autoComplete="off"
          label="Email"
          margin="dense"
          required
        />
        <TextField
          id="university"
          variant="outlined"
          onChange={onUniversityChanged}
          value={university}
          autoComplete="off"
          label="University"
          margin="dense"
          required
        />
        <TextField
          id="password"
          variant="outlined"
          type="password"
          onChange={onPasswordChanged}
          value={password}
          autoComplete="off"
          label="Password"
          margin="dense"
        />
        <TextField
          id="confirmPassword"
          variant="outlined"
          type="password"
          error={!match}
          helperText={match ? "" : "Passwords do not match"}
          onChange={onCnfPasswordChanged}
          value={cnfPassword}
          autoComplete="off"
          label="Confirm Password"
          margin="dense"
        />
      </form>
    </>
  )
  return content
}

export default EditUserForm