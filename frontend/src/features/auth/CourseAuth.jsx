import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useGetCoursesQuery } from "../courses/coursesApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentCourse } from "../courses/courseSlice";

const CourseAuth = () => {
  const location = useLocation();
  const { userId, isSiteAdmin } = useAuth();

  let courseId = useSelector(selectCurrentCourse);

  // if accessing a course, need to check if user is in course
  const { course } = useGetCoursesQuery("coursesList", {
    selectFromResult: ({ data }) => ({
      course: data?.entities[courseId],
    }),
  });

  const allowed = course?.users.some((user) => user.userid === userId);
  let content;
  if (course && (allowed || isSiteAdmin)) {
    content = <Outlet />;
  } else content = <Navigate to="/dash" state={{ from: location }} replace />;

  return content;
};
export default CourseAuth;
