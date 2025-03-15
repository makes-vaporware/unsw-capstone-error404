import { useState, useEffect } from "react";
import { useChangeCourseRoleMutation } from "../features/admin/adminApiSlice";
import Snackbar from "@mui/material/Snackbar";
import { useKickMutation } from "../features/courses/coursesApiSlice";
const UserCardCourseAdmin = ({ user, course }) => {
  const [changeCourseRole, { isSuccess, error }] =
    useChangeCourseRoleMutation();
  const [kick, { isSuccess: isKickSuccess, error: kickError }] =
    useKickMutation();
  const initialRole = course.users.find((u) => u.userid === user.id).role;
  const [role, setRole] = useState(initialRole);

  // role changing:
  const handleChangeRole = (e) => {
    setRole(e.target.value);
  };
  const commitChange = () => {
    changeCourseRole({
      userId: user.id,
      courseId: course.id,
      newRole: role,
    });
  };
  const [message, setMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
    setMessage("");
  };
  useEffect(() => {
    if (isSuccess) {
      setMessage(`${user.name} changed to ${role}`);
      setSnackbarOpen(true);
    } else if (error) {
      setMessage(`${error}`);
      setSnackbarOpen(true);
    }
  }, [isSuccess, error]);

  //kicking:
  const onKickClick = () => {
    kick({
      toKickId: user.id,
      courseId: course.id,
    });
  };
  useEffect(() => {
    if (isKickSuccess) {
      setMessage(`${user.name} removed`);
      setSnackbarOpen(true);
    } else if (kickError) {
      setMessage(`${kickError.message}`);
      setSnackbarOpen(true);
    }
  }, [isKickSuccess, kickError]);
  return (
    <div className="card" >
      <div className="card__header">
        <div className="card__title">{user.name}</div>
      </div>

      <div className="card__description">{`${user.id} ${initialRole}`}</div>
      <select
        name="new-course-role"
        id="course-roles"
        value={role}
        onChange={handleChangeRole}
      >
        <option value={"student"}>Student</option>
        <option value={"academic"}>Academic</option>
        <option value={"course-admin"}>Course Admin</option>
      </select>
      {initialRole !== role && (
        <button className="button--primary" onClick={commitChange}>Change Role</button>
      )}
      <br />
      <button className="button--secondary" onClick={onKickClick}>Remove</button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </div>
  );
};
export default UserCardCourseAdmin;
