import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import { useGetCoursesQuery } from "../features/courses/coursesApiSlice";
import { selectCurrentCourse } from "../features/courses/courseSlice";
import { ROLES } from "../config/roles";
import { useGetUsersQuery } from "../features/users/usersApiSlice";

// update for roles later
const useAuth = () => {
  const token = useSelector(selectCurrentToken);
  const courseId = useSelector(selectCurrentCourse);

  let isSiteAdmin;
  let isCourseAdmin
  let isAcademic
  let isStudent
  let course
  let usersData

  try {
    const result = useGetCoursesQuery("coursesList", {
      selectFromResult: ({ data }) => ({
        course: data?.entities[courseId],
      }),
    });
    course = result.course;

    const {
      data,
      isSuccess: isGetSuccess,
      isLoading: isGetLoading,
      isError: isGetError,
      error: getError
    } = useGetUsersQuery()
    usersData = data;
        
  } catch (error) {
    console.log(error);
  }

  

  if (token) {
    const decoded = jwtDecode(token);
    const id = decoded?.UserInfo?._id;
    const roles = []; // User/Site Admin, Course Admin/Student/Academic 
    if (usersData) {
      roles.push(usersData.entities[id].isSiteAdmin ? "Site Admin": "User");
    } else {
      roles.push("User");
    }
    isSiteAdmin = roles.includes("Site Admin");
    if (course) {
      for (const user of course.users) {
        if (user.userid === id && user.role === "course-admin") {
          isCourseAdmin = true
          roles.push(ROLES.CourseAdmin);
        } else if (user.userid === id && user.role === "student"){
          isStudent = true;
          roles.push(ROLES.Student);
        } else if (user.userid === id && user.role === "academic"){
          isAcademic = true;
          roles.push(ROLES.Academic);
        }
      }
    }
    return { roles, isSiteAdmin, userId: id, isCourseAdmin, isAcademic, isStudent };
  }
  // not logged in, cannot access
  return { userId: "", roles: [], isSiteAdmin, isCourseAdmin, isAcademic, isStudent };
};
export default useAuth;
