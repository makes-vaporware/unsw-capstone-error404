import { useState, useEffect } from "react";
import { useChangeSiteRoleMutation } from "../features/admin/adminApiSlice";
import { PulseLoader } from "react-spinners";
import Snackbar from "@mui/material/Snackbar";
import { useDeleteUserMutation } from "../features/users/usersApiSlice";
import { MenuItem, Select } from "@mui/material";
const UserCard = ({ user }) => {
  const [changeSiteRole, { isLoading: isChangeLoading, isSuccess, error }] =
    useChangeSiteRoleMutation();
  const [
    deleteUser,
    { isLoading: isDeleteLoading, isDeleteSuccess, errorDelete },
  ] = useDeleteUserMutation();
  const initialRole = user.isSiteAdmin ? "Site Admin" : "User";
  const [role, setRole] = useState(initialRole);

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

  const handleChangeRole = (e) => {
    setRole(e.target.value);
  };
  const commitChange = () => {
    let becomeSiteAdmin = false;
    if (role === "Site Admin") {
      becomeSiteAdmin = true;
    }
    changeSiteRole({
      userId: user.id,
      becomeSiteAdmin,
    });
  };

  const handleDeleteClick = () => {
    deleteUser({ id: user.id });
  };

  return (
    <div className="card" /* onClick={handleClick} */>
      <div className="card__header">
        <div className="card__title">
          {user.name} <em>{user.email}</em>
        </div>
      </div>

      <div className="card__description">{`${user.id} ${
        user.isSiteAdmin ? "Site Admin" : "User"
      }`}</div>

      <Select
        size="small"
        value={role}
        onChange={handleChangeRole}
        label="Change role"
      >
        <MenuItem value={"User"}>User</MenuItem>
        <MenuItem value={"Site Admin"}>Site Admin</MenuItem>
      </Select>
      <button className="button--secondary" onClick={handleDeleteClick}>Delete User</button>
      {initialRole !== role && (
        <button disabled={isChangeLoading} className="button--secondary" onClick={commitChange}>
          {isChangeLoading ? <PulseLoader /> : `change role`}
        </button>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </div>
  );
};
export default UserCard;
