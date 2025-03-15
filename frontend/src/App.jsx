import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./features/auth/Login.jsx";
import Public from "./components/Public.jsx";
import Register from "./features/auth/Register.jsx";
import Dash from "./features/courses/Dash.jsx";
import RequireAuth from "./features/auth/requireAuth.jsx";
import Profile from "./features/users/Profile.jsx";
import DashLayout from "./components/DashLayout.jsx";
import EditUser from "./features/users/EditUser.jsx";
import Prefetch from "./features/auth/Prefetch.jsx";
import PersistLogin from "./features/auth/PersistLogin.jsx";
import { ROLES } from "./config/roles.js";
import Groups from "./features/groups/Groups.jsx";
import CourseAuth from "./features/auth/CourseAuth.jsx";
import CourseDash from "./features/courses/CourseDash.jsx"
import GroupDash from "./features/groups/GroupDash.jsx";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blue, grey } from '@mui/material/colors';
import Projects from "./features/projects/Projects.jsx";
import ProjectDash from "./features/projects/ProjectDash.jsx";
import AdminDash from "./features/admin/AdminDash.jsx";
import ViewProfile from "./features/users/ViewProfile.jsx";


const theme = createTheme({
  palette: {
    primary: {
      main: blue["900"],
      contrastText: grey["50"],
      
    },
    secondary: {
      // main: grey["800"]
      main: grey["50"],
      contrastText: grey["50"],
    }

  },
});


function App() {
  return (
    <ThemeProvider theme={theme}>
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Public />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* protected routes */}
          <Route element={<PersistLogin />}>
            <Route
              element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}
            >
              <Route element={<Prefetch />}>
                <Route path="/dash" element={<DashLayout />}>
                  <Route index element={<Dash />} />
                  <Route element={<RequireAuth allowedRoles={["Site Admin"]}/>}>
                      <Route path="admin" element={<AdminDash/>}/>
                    </Route>
                  <Route element={<CourseAuth />}>
                    <Route path="course" element={<CourseDash />} />
                    {/* Course Dash is for viewing the info of an individual course in more detail */}
                    <Route element={<RequireAuth allowedRoles={["Student", "Course Admin", "Site Admin"]}/>}>
                      <Route path="groups" element={<Groups />} />
                      <Route path="groups/view" element={<GroupDash />} />
                    </Route>
                    <Route path="projects" element={<Projects /> } />
                    <Route path="projects/view" element={<ProjectDash />} />
                  </Route>
                  {/* </Route> */}
                  <Route path="profile" element={<Profile />} />
                  <Route path="profile/view" element={<ViewProfile />} />
                  <Route path="profile/edit" element={<EditUser />} />
                </Route>{" "}
                close dash layout
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
    </ThemeProvider>
  );
}

export default App;
