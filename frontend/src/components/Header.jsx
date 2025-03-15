import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faRightFromBracket,
  faUserGroup,
  faFileLines,
  faHouse
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSendLogoutMutation } from "../features/auth/authApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import logoNoBackground from "../assets/logo-no-background.svg";
import { useGetCoursesQuery } from "../features/courses/coursesApiSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentCourse,
  logoutOfCourse,
} from "../features/courses/courseSlice";
import useAuth from "../hooks/useAuth";
import { logoutOfGroup } from "../features/groups/groupSlice";
const DASH_REGEX = /^\/dash(\/)?$/;
const NOTES_REGEX = /^\/dash\/notes(\/)?$/;
const USERS_REGEX = /^\/dash\/users(\/)?$/;

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { isAcademic, isSiteAdmin } = useAuth()
  const [sendLogout, { isLoading, isSuccess, isError, error }] =
    useSendLogoutMutation();

  const courseId = useSelector(selectCurrentCourse);
  const { course } = useGetCoursesQuery("coursesList", {
    selectFromResult: ({ data }) => ({
      course: data?.entities[courseId],
    }),
  });

  useEffect(() => {
    if (isSuccess || isLoading) navigate("/");
  }, [isSuccess, isLoading, navigate]);

  const onProfileClicked = () => navigate("/dash/profile");
  const onLogoutClicked = () => {
    sendLogout();
    dispatch(logoutOfCourse())
    dispatch(logoutOfGroup())
  };
  let dashClass = null;
  if (
    !DASH_REGEX.test(pathname) &&
    !NOTES_REGEX.test(pathname) &&
    !USERS_REGEX.test(pathname)
  ) {
    dashClass = "dash-header__container--small";
  }

  let courseNav;
  if (course)
    courseNav = <span style={{ color: "#fff" }}>{course.name} - {course.courseCode}</span>;
  const path = "/dash";

  const profileButton = (
    <button className="icon-button" title="Profile" onClick={onProfileClicked}>
      <FontAwesomeIcon icon={faUser} color="#ede9ff"/>
    </button>
  );

  const logoutButton = (
    <button
      className="icon-button"
      title="Logout"
      name="button-logout"
      onClick={onLogoutClicked}
    >
      <FontAwesomeIcon icon={faRightFromBracket} color="#ede9ff"/>
    </button>
  );

  const groupsButton = (
    <button
      className="icon-button"
      title="Groups"
      name="button-to-groups"
      onClick={() => navigate(path + "/groups")}
    >
      <FontAwesomeIcon icon={faUserGroup} color="#ede9ff"/>
    </button>
  )

  const projectsButton = (
    <button
      className="icon-button"
      title="Projects"
      name="button-to-projects"
      onClick={() => navigate(path + '/projects')}
      >
        <FontAwesomeIcon icon={faFileLines} color="#ede9ff" />
      </button>
  )

  const adminButton = (
    <button
      className="icon-button"
      title="Admin"
      name="button-to-admin"
      onClick={() => navigate(path + '/admin')}
      >
        ADMIN
      </button>
  )

  const errClass = isError ? "errmsg" : "offscreen";

  let buttonContent;
  if (isLoading) {
    buttonContent = <PulseLoader color={"#FFF"} />;
  } else {
    buttonContent = (
      <>
        {courseId && !isAcademic && groupsButton}
        {courseId && projectsButton}
        {profileButton}
        {isSiteAdmin && adminButton}
        {logoutButton}
      </>
    );
  }

  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>

      <header className="dash-header">
        <div className={`dash-header__container  dark-mode ${dashClass}`}>
          <Link to="/dash">
            <div className="dash-header__nav">
              <img src={logoNoBackground} alt="Home" width="50px" height="50px"/>
              <button id="home" className="icon-button"><FontAwesomeIcon icon={faHouse} color="#ede9ff" /></button>
            </div>
          </Link>
          {course && courseId && <Link to={path + '/course'}> {courseNav} </Link>}
          <nav className="dash-header__nav">{buttonContent}</nav>
        </div>
      </header>
    </>
  );

  return content;
};

export default Header;
