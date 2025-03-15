import useAuth from "../hooks/useAuth";
import CourseCard from "./CourseCard";
import { useDispatch } from "react-redux";
import { setCurrentCourse } from "../features/courses/courseSlice";
import { useNavigate } from "react-router-dom";

const CourseCardBasic = ({ course, preview }) => {
  const dispatch = useDispatch();
  const { userId } = useAuth();
  const navigate = useNavigate()

  const handleClick = () => {
    if (!preview) {
      //then store the course in global state. The dashboard now knows what course you are thinking about.
      dispatch(setCurrentCourse(course.id));
      //and go to individual course dash
      navigate('course')
    }
  };

  return (
    <div className="card card--small" onClick={handleClick}>
      <CourseCard course={course} clickable={true} />
    </div>
  );
};

export default CourseCardBasic;
