import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "./authApiSlice";
import { useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { setCredentials } from "./authSlice";
import logoNoBackground from "../../assets/logo-no-background.svg";
import { TextField, ThemeProvider, createTheme } from "@mui/material";

const EMAIL_REGEX = /^[A-z0-9]+@[A-z0-9]+\.edu\.au/;

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [register, { isLoading, isSuccess }] = useRegisterMutation();

  const errRef = useRef();
  const nameRef = useRef();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [cnfPassword, setCnfPassword] = useState("");
  const [match, setMatch] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    setMatch(password === cnfPassword);
  }, [password, cnfPassword]);

  useEffect(() => {
    if (isSuccess) {
      setName("");
      setEmail("");
      setPassword("");
      setCnfPassword("");
      setUniversity("");
      navigate("/dash");
    }
  }, [isSuccess, navigate]);

  const onNameChanged = (e) => setName(e.target.value);
  const onEmailChanged = (e) => setEmail(e.target.value);
  const onUniversityChanged = (e) => setUniversity(e.target.value);
  const onPasswordChanged = (e) => setPassword(e.target.value);
  const onCnfPasswordChanged = (e) => setCnfPassword(e.target.value);

  const onSaveUserClicked = async (e) => {
    e.preventDefault();
    // error checking
    if (!email.match(EMAIL_REGEX)) setValidEmail(false);
    else if (password !== cnfPassword) setMatch(false);
    else {
      setValidEmail(true);
      setMatch(true);
      try {
        const { accessToken } = await register({
          email,
          password,
          name,
          university,
        }).unwrap();
        dispatch(setCredentials({ accessToken }));
        setName("");
        setEmail("");
        setUniversity("");
        setPassword("");
        setCnfPassword("");
        navigate("/dash");
      } catch (err) {
        if (!err.status) {
          setErrMsg("No Server Response");
        } else if (err.status === 400) {
          setErrMsg("Missing Name or Password");
        } else if (err.status === 401) {
          setErrMsg("Unauthorized");
        } else if (err.status === 409) {
          setErrMsg("Email is already registered");
        } else {
          setErrMsg(err.data?.message);
        }
        errRef.current.focus();
      }
    }
  };

  const handleLogIn = () => {
    navigate("/login");
  };

  if (isLoading)
    return (
      <div className="dark-mode" style={{ height: "100vh" }}>
        <PulseLoader color={"#FFF"} />
      </div>
    );

  const errClass = errMsg ? "errmgs" : "offscreen";
  const errMessage = (
    <p className={errClass} ref={errRef} aria-live="assertive">
      {errMsg}
    </p>
  );

  const content = (
    <div className="page--dark-mode">
      <img
        src={logoNoBackground}
        alt="AlignEd Logo"
        width="150px"
        height="150px"
      />
      <div className="block">
        <h2 style={{ color: "#EDE9FF" }}>Sign Up</h2>
        {errMessage}

        <form className="form" onSubmit={onSaveUserClicked}>
          <ThemeProvider theme={darkTheme}>
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
              helperText={
                validEmail ? "" : "Please use an education email address"
              }
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
              required
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
              required
            />
            <button
              className="form__submit-button"
              title="register"
              name="button-submit"
            >
              Sign Up
            </button>
          </ThemeProvider>
        </form>
        <h5 style={{ color: "#EDE9FF" }}>Already have an account?</h5>
        <button onClick={handleLogIn}> Log In</button>
      </div>
    </div>
  );
  return content;
};

export default Register;
