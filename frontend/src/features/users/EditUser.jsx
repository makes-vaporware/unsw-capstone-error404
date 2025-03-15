import { PulseLoader } from "react-spinners";
import EditUserForm from "./EditUserForm.jsx";
import { useGetUserQuery } from "./usersApiSlice.js";
import useAuth from "../../hooks/useAuth.js";

const EditUser = () => {
  const {userId } = useAuth()
  
  const { data,
    isLoading
   } = useGetUserQuery({ userId });

  if (isLoading) return <PulseLoader />
  else if (!data) return <div> Sorry, something went wrong </div>
  return <EditUserForm user={data} />;
};

export default EditUser;
