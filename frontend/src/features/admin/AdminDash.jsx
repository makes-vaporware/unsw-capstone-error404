import { PulseLoader } from "react-spinners";

import { useGetUsersQuery } from "../users/usersApiSlice";
import { useState } from "react";
import UserCard from "../../components/UserCardSiteAdmin";

const AdminDash = () => {
  const {
    data
  } = useGetUsersQuery();

  const [errMsg, setErrMsg] = useState("");
  const errClass = errMsg ? "errmsg" : "offscreen";

  let users;
  if (data) {
    users = data.ids.map((uid, i) => <UserCard key={i} user={data.entities[uid]}/>)
  } else {
    users = <PulseLoader />;
  }

  return (
    <div className="page">
      <div className="card__display-box">
        <h3>All Users</h3>
        <div className="card__scroll-display-box">
          {users}
        </div>
      </div>
      
    </div>
  );
};

export default AdminDash;
