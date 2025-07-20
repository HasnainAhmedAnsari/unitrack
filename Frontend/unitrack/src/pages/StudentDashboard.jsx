import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../index.css";

const StudentDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("enrollments");
  const [grades, setGrades] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [enrolling, setEnrolling] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);

  const numericStudentId = id && id.startsWith("S") ? id.replace("S", "") : id;

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await axios.get(`/students/grades/${numericStudentId}`);
        setGrades(res.data);
      } catch (err) {
        console.error("Error fetching grades", err);
      }
    };
    if (id) fetchGrades();
  }, [id]);

  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        const res = await axios.get(`/students/courses`);
        setAvailableCourses(res.data);
      } catch (err) {
        console.error("Error fetching available courses", err);
      }
    };
    fetchAvailableCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get(`/students/enrolled/${numericStudentId}`);
      setEnrollments(res.data);
    } catch (err) {
      console.error("Error fetching enrolled courses", err);
    }
  };

  useEffect(() => {
    if (id) fetchEnrollments();
  }, [id]);

  const handleExpand = (courseId) => {
    setExpandedRows((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const getGradeForCourse = (courseId) =>
    grades.find((g) => g.course_id === courseId);

  const isEnrolled = (courseId) =>
    enrollments.some((c) => c.course_id === courseId);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await axios.post(`/students/enroll/${numericStudentId}/${courseId}`);
      setPopupMsg("You are successfully enrolled!");
      setShowPopup(true);
      await fetchEnrollments();
    } catch (err) {
      setPopupMsg("Enrollment failed. Please try again.");
      setShowPopup(true);
      console.error("Error enrolling in course", err);
    }
    setEnrolling(null);
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const res = await axios.get(`/students/info/${numericStudentId}`);
        setStudentInfo(res.data);
      } catch (err) {
        console.error("Error fetching student info", err);
      }
    };
    if (numericStudentId) fetchStudentInfo();
  }, [numericStudentId]);

  return (
    <div>
      
      <div className="flex py-4 px-12 justify-between items-center rounded shadow"
        style={{ backgroundColor: "#0f0f40", color: "#ffffff" }}

      >
        <h1 className=" font-bold text-blue-500" style={{ fontSize: "36px" }}>
          UniTrack
        </h1>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>


      <div className="px-12 bg-gray-100 py-8 h-screen">

      <h1 className="text-2xl font-bold mb-4">
        Welcome,{" "}
        {studentInfo
          ? `${studentInfo.student_name} - S${studentInfo.student_id}`
          : `Student ${id}`}
      </h1>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 rounded ${
            activeTab === "available" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Available Courses
        </button>
        <button
          onClick={() => setActiveTab("enrollments")}
          className={`px-4 py-2 rounded ${
            activeTab === "enrollments"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          My Enrollments
        </button>
      </div>

      {/* Success/Fail Popup */}
      {showPopup && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {popupMsg}
        </div>
      )}

      {/* Enrollments Table */}
      {activeTab === "enrollments" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">My Enrolled Courses</h2>
          {enrollments.length > 0 ? (
            <table className="min-w-full border mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Course Code</th>
                  <th className="border px-4 py-2">Title</th>
                  <th className="border px-4 py-2">Credits</th>
                  <th className="border px-4 py-2">Instructor</th>
                  <th className="border px-4 py-2">Department</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">See Grades</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((course) => {
                  const grade = getGradeForCourse(course.course_id);
                  return (
                    <React.Fragment key={course.course_id}>
                      <tr>
                        <td className="border px-4 py-2">
                          {course.code || course.course_code}
                        </td>
                        <td className="border px-4 py-2">
                          {course.title || course.course_name}
                        </td>
                        <td className="border px-4 py-2">{course.credits}</td>
                        <td className="border px-4 py-2">{course.instructor_name || "N/A"}</td>
                        <td className="border px-4 py-2">{course.department_name}</td>
                        <td className="border px-4 py-2">
                          <span
                            className={
                              course.status === "Passed"
                                ? "text-green-600 font-semibold"
                                : course.status === "Failed"
                                ? "text-red-600 font-semibold"
                                : "text-yellow-600 font-semibold"
                            }
                          >
                            {course.status || "In Progress"}
                          </span>
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {grade ? (
                            <button
                              className="text-blue-600 underline"
                              onClick={() => handleExpand(course.course_id)}
                            >
                              {expandedRows.includes(course.course_id)
                                ? "Hide Grades"
                                : "See Grades"}
                            </button>
                          ) : (
                            <span className="text-gray-400">No Grades</span>
                          )}
                        </td>
                      </tr>
                      {/* Expanded Row for Grades */}
                      {expandedRows.includes(course.course_id) && grade && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border px-4 py-2 bg-gray-50"
                          >
                            <div>
                              <table className="min-w-full border mb-2">
                                <thead>
                                  <tr>
                                    <th className="border px-2 py-1">
                                      Assessment
                                    </th>
                                    <th className="border px-2 py-1">Marks</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="border px-2 py-1">
                                      Assignment 1
                                    </td>
                                    <td className="border px-2 py-1">
                                      {grade.assignment1}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border px-2 py-1">
                                      Assignment 2
                                    </td>
                                    <td className="border px-2 py-1">
                                      {grade.assignment2}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border px-2 py-1">Quiz 1</td>
                                    <td className="border px-2 py-1">
                                      {grade.quiz1}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border px-2 py-1">Quiz 2</td>
                                    <td className="border px-2 py-1">
                                      {grade.quiz2}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border px-2 py-1">Mid</td>
                                    <td className="border px-2 py-1">
                                      {grade.mid}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border px-2 py-1">Final</td>
                                    <td className="border px-2 py-1">
                                      {grade.final}
                                    </td>
                                  </tr>
                                  <tr className="font-semibold">
                                    <td className="border px-2 py-1">
                                      Total Marks
                                    </td>
                                    <td className="border px-2 py-1">
                                      {grade.total_marks}
                                    </td>
                                  </tr>
                                  <tr className="font-semibold">
                                    <td className="border px-2 py-1">Grade</td>
                                    <td className="border px-2 py-1">
                                      {grade.grade}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No enrolled courses.</p>
          )}
        </div>
      )}

      {/* Available Courses Table */}
      {activeTab === "available" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Available Courses</h2>
          {availableCourses.length > 0 ? (
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Course Code</th>
                  <th className="border px-4 py-2">Title</th>
                  <th className="border px-4 py-2">Credits</th>
                  <th className="border px-4 py-2">Availability</th>
                  <th className="border px-4 py-2">Enrollment</th>
                </tr>
              </thead>
              <tbody>
                {availableCourses.map((course) => {
                  const enrolled = isEnrolled(course.course_id);
                  return (
                    <tr key={course.course_id}>
                      <td className="border px-4 py-2">{course.code}</td>
                      <td className="border px-4 py-2">{course.title}</td>
                      <td className="border px-4 py-2">{course.credits}</td>
                      <td className="border px-4 py-2">
                        {course.availability}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {enrolled ? (
                          <button
                            className="bg-gray-300 text-gray-600 px-3 py-1 rounded cursor-not-allowed"
                            disabled
                            title="You are already enrolled in this course"
                          >
                            Enrolled
                          </button>
                        ) : (
                          <button
                            className={`bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition ${
                              enrolling === course.course_id
                                ? "opacity-50 cursor-wait"
                                : ""
                            }`}
                            onClick={() => handleEnroll(course.course_id)}
                            disabled={enrolling === course.course_id}
                          >
                            {enrolling === course.course_id
                              ? "Enrolling..."
                              : "Enroll"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No available courses.</p>
          )}
        </div>
      )}
    </div>

    </div>
  );
};

export default StudentDashboard;