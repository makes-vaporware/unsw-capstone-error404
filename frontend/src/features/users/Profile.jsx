import useAuth from "../../hooks/useAuth.js";
import { useGetCoursesQuery } from "../courses/coursesApiSlice.jsx";
import { useGetUserQuery } from "./usersApiSlice.js";
import { useNavigate } from "react-router-dom";
import SkillsDropdown from "../../components/SkillsDropdown.jsx";
import CreateSkillButton from "../../components/CreateSkillButton.jsx";

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();

  const {
    data: profile,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetUserQuery({ userId: userId });

  const { data: courses, isSuccess: isCoursesSuccess } = useGetCoursesQuery({
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  let content;
  if (isLoading) content = <p>Loading...</p>;

  if (isError) {
    content = (
      <p className={isError ? "errmsg" : "offscreen"}>{error?.data?.message}</p>
    );
  }



  // once information is fetched, return page
  if (isSuccess) {
    let courseString = "";
    let isStudent = false;
    if (isCoursesSuccess) {
      for (const course of profile.courses) {
        // create string of courses
        const loadedCourse = courses?.entities[course.courseid];
        if (courseString !== "") courseString = courseString + ", ";
        else courseString = "Courses: ";
        courseString =
          courseString +
          loadedCourse?.name +
          " (" +
          loadedCourse?.courseCode +
          ")";
        // check if user is student in some course
        for (const user of loadedCourse.users) {
          if (user.userid === userId && user.role === "student")
            isStudent = true;
        }
      }
    }

    const info = <div className="manual">Here you can edit your profile details. By clicking 'Edit' you can also change your password.</div>
    const studentInfo = <div className="manual">Here you can edit your profile details or add your skills. By clicking 'Edit' you can also change your password.</div> 
    content = (
      <>
        <div className="page-title">{profile.name}</div>
        <button title="edit-profile" className="button--secondary" onClick={() => navigate("edit")}>
          Edit
        </button>
        { isStudent ? studentInfo : info }
        <p>Email: {profile.email}</p>
        <p>University: {profile.university}</p>
        <p>
          {profile.courses.length > 0 ? (
            <>{courseString}</>
          ) : (
            <>You are not in any courses</>
          )}
        </p>
        {isStudent && <SkillsDropdown user={profile} />}
        {isStudent && <CreateSkillButton />}
      </>
    );
  }

  return content;
};

export default Profile;
