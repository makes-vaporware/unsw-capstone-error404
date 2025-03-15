import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useLoginMutation } from './authApiSlice'
import { setCredentials } from './authSlice'
import { useDispatch } from 'react-redux'
import logoNoBackground from '../../assets/logo-no-background.svg'
import usePersist from '../../hooks/usePersist.js'
import { Checkbox, FormControlLabel, TextField, ThemeProvider, createTheme } from '@mui/material'


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Login = () => {
  const errRef = useRef()
  const nameRef = useRef()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [persist, setPersist] = usePersist()

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [login, { isLoading }] = useLoginMutation()

  useEffect(() => {
    setErrMsg('');
  }, [email, password])

  useEffect(() => {
    nameRef.current.focus()
  }, [])

  const handleSignUp = () => {
    navigate('/register')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { accessToken } = await login({ email, password }).unwrap()
      dispatch(setCredentials({ accessToken }))
      setEmail('')
      setPassword('')
      navigate('/dash')
    } catch (err) {
      if (!err.status) {
          setErrMsg('No Server Response')
      } else if (err.status === 400) {
          setErrMsg('Missing Username or Password');
      } else if (err.status === 401) {
          setErrMsg('Unauthorized')
      } else {
          setErrMsg(err.data?.message)
      }
      errRef.current.focus()
    }
  }

  const handleEmailInput = (e) => setEmail(e.target.value)
  const handlePwdInput = (e) => setPassword(e.target.value)
  const handleToggle = () => setPersist(prev => !prev)

  const errClass = errMsg ? "errmsg" : ""

  let errMessage = <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>
  
  if (isLoading) {
    errMessage = <p ref={errRef} className={errClass} aria-live="assertive">loading...</p>
  }

  const content = (<>
  <main >
    <div className="page--dark-mode">
      <img src={logoNoBackground} alt="AlignEd Logo" width="150px" height="150px"/>
      <div className='block'>
        <h2 >Log In</h2>
        { errMessage }
        <form className="form" onSubmit={handleSubmit}>
          <ThemeProvider theme={darkTheme}>
            <TextField
              id="email"
              variant="outlined"
              onChange={handleEmailInput}
              value={email}
              ref={nameRef}
              autoComplete="off"
              label="Email"
              margin="dense"
              required
            />

            <TextField
              id="password"
              variant="outlined"
              type="password"
              onChange={handlePwdInput}
              value={password}
              autoComplete="off"
              label="Password"
              margin="dense"
              required
            />
            <button name="button-submit">Sign In</button>

            <FormControlLabel control={<Checkbox 
              onChange={handleToggle}
              checked={persist}
              id="persist"
            />} label="Trust This Device" />
          </ThemeProvider>
      </form>
      <h5 >Don't have an account?</h5>
      <button name="button-go-to-signup" onClick={handleSignUp}> Sign Up</button>
      </div>
    </div>
  </main>
  </>)

  return content
}

export default Login