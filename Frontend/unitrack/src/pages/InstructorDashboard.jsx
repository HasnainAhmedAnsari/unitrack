import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../index.css";

const assessmentMeta = [
  { label: "Assignment 1", field: "assignment1", max: 5 },
  { label: "Assignment 2", field: "assignment2", max: 5 },
  { label: "Quiz 1", field: "quiz1", max: 5 },
  { label: "Quiz 2", field: "quiz2", max: 5 },
  { label: "Mid", field: "mid", max: 30 },
  { label: "Final", field: "final", max: 50 },
];

const InstructorDashboard = () => {
  const { id } = useParams(); // e.g., I1
  const navigate = useNavigate();

  const [instructorInfo, setInstructorInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [studentsByCourse, setStudentsByCourse] = useState({});
  const [editingGrade, setEditingGrade] = useState({});
  const [editForm, setEditForm] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");

  const numericInstructorId =
    id && id.startsWith("I") ? id.replace("I", "") : id;

  // Fetch instructor info (with department)
  useEffect(() => {
    const fetchInstructorInfo = async () => {
      try {
        const res = await axios.get(`/instructors/info/${numericInstructorId}`);
        setInstructorInfo(res.data);
      } catch (err) {
        console.error("Error fetching instructor info", err);
      }
    };
    if (numericInstructorId) fetchInstructorInfo();
  }, [numericInstructorId]);

  // Fetch instructor's courses (with department)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`/instructors/${numericInstructorId}/courses`);
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses", err);
      }
    };
    if (numericInstructorId) fetchCourses();
  }, [numericInstructorId]);

  // Fetch students with grades for a course
  const fetchStudentsWithGrades = async (courseId) => {
    try {
      const res = await axios.get(`/instructors/students-grades/${courseId}`);
      setStudentsByCourse((prev) => ({ ...prev, [courseId]: res.data }));
    } catch (err) {
      console.error("Error fetching students/grades", err);
    }
  };

  // Expand/collapse course row
  const handleExpand = async (courseId) => {
    if (expandedRows.includes(courseId)) {
      setExpandedRows(expandedRows.filter((cid) => cid !== courseId));
      return;
    }
    await fetchStudentsWithGrades(courseId);
    setExpandedRows([...expandedRows, courseId]);
  };

  // Start editing grades for a student
  const handleEditGrades = (courseId, student) => {
    setEditingGrade({ [`${courseId}_${student.student_id}`]: true });
    setEditForm({
      [`${courseId}_${student.student_id}`]: {
        assignment1: student.assignment1 || 0,
        assignment2: student.assignment2 || 0,
        quiz1: student.quiz1 || 0,
        quiz2: student.quiz2 || 0,
        mid: student.mid || 0,
        final: student.final || 0,
      },
    });
  };

  // Cancel editing
  const handleCancelEdit = (courseId, studentId) => {
    setEditingGrade((prev) => ({
      ...prev,
      [`${courseId}_${studentId}`]: false,
    }));
    setEditForm((prev) => {
      const newForm = { ...prev };
      delete newForm[`${courseId}_${studentId}`];
      return newForm;
    });
  };

  // Save/update grades
  const handleUpdateGrades = async (courseId, studentId) => {
    const form = editForm[`${courseId}_${studentId}`];
    try {
      await axios.post(`/instructors/${numericInstructorId}/assign-grades`, {
        student_id: studentId,
        course_id: courseId,
        assignment1: form.assignment1,
        assignment2: form.assignment2,
        quiz1: form.quiz1,
        quiz2: form.quiz2,
        mid: form.mid,
        final: form.final,
      });
      setPopupMsg("Grades updated successfully!");
      setShowPopup(true);
      setEditingGrade((prev) => ({
        ...prev,
        [`${courseId}_${studentId}`]: false,
      }));
      await fetchStudentsWithGrades(courseId); // Refresh grades
    } catch (err) {
      setPopupMsg("Error updating grades.");
      setShowPopup(true);
      console.error("Error updating grades", err);
    }
  };

  // Hide popup after 2 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

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


      <h1 className="text-2xl font-bold mb-1">
        Welcome,{" "}
        {instructorInfo
          ? `${instructorInfo.instructor_name} - I${instructorInfo.instructor_id}`
          : `Instructor ${id}`}
      </h1>
      {instructorInfo && (
        <h2 className="text-lg font-semibold mb-4">
          Department: {instructorInfo.department_name}
        </h2>
      )}

      {showPopup && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {popupMsg}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">My Assigned Courses</h2>
      {courses.length > 0 ? (
        <table className="min-w-full border mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Course Code</th>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Availability</th>
              <th className="border px-4 py-2">Total Students</th>
              <th className="border px-4 py-2">Department</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <React.Fragment key={course.course_id}>
                <tr>
                  <td className="border px-4 py-2">{course.code}</td>
                  <td className="border px-4 py-2">{course.title}</td>
                  <td className="border px-4 py-2">{course.availability}</td>
                  <td className="border px-4 py-2">{course.total_students}</td>
                  <td className="border px-4 py-2">{course.department_name}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => handleExpand(course.course_id)}
                    >
                      {expandedRows.includes(course.course_id)
                        ? "Hide Students"
                        : "Show Students"}
                    </button>
                  </td>
                </tr>
                {expandedRows.includes(course.course_id) && (
                  <tr>
                    <td colSpan={6} className="border px-4 py-2 bg-gray-50">
                      <div>
                        <h3 className="font-semibold mb-2">
                          Enrolled Students
                        </h3>
                        {studentsByCourse[course.course_id] &&
                        studentsByCourse[course.course_id].length > 0 ? (
                          <table className="min-w-full border mb-2">
                            <thead>
                              <tr>
                                <th className="border px-2 py-1">Student ID</th>
                                <th className="border px-2 py-1">Name</th>
                                <th className="border px-2 py-1">
                                  Total Marks
                                </th>
                                <th className="border px-2 py-1">Grade</th>
                                <th className="border px-2 py-1">
                                  Assign/Edit Grades
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentsByCourse[course.course_id].map(
                                (student) => {
                                  const isEditing =
                                    editingGrade[
                                      `${course.course_id}_${student.student_id}`
                                    ];
                                  const form =
                                    editForm[
                                      `${course.course_id}_${student.student_id}`
                                    ] || {};
                                  return (
                                    <React.Fragment key={student.student_id}>
                                      <tr>
                                        <td className="border px-2 py-1">
                                          S{student.student_id}
                                        </td>
                                        <td className="border px-2 py-1">
                                          {student.student_name}
                                        </td>
                                        <td className="border px-2 py-1">
                                          {student.total_marks ?? "-"}
                                        </td>
                                        <td className="border px-2 py-1">
                                          {student.grade ?? "-"}
                                        </td>
                                        <td className="border px-2 py-1">
                                          {!isEditing ? (
                                            <button
                                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                                              onClick={() =>
                                                handleEditGrades(
                                                  course.course_id,
                                                  student
                                                )
                                              }
                                            >
                                              Assign/Edit Grades
                                            </button>
                                          ) : (
                                            <button
                                              className="bg-gray-400 text-white px-2 py-1 rounded"
                                              disabled
                                            >
                                              Editing...
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                      {/* Editable row */}
                                      {isEditing && (
                                        <tr>
                                          <td
                                            colSpan={5}
                                            className="border px-2 py-1 bg-gray-50"
                                          >
                                            <table className="w-full border mb-2">
                                              <thead>
                                                <tr>
                                                  <th className="border px-2 py-1">
                                                    Assessment
                                                  </th>
                                                  <th className="border px-2 py-1">
                                                    Marks
                                                  </th>
                                                  <th className="border px-2 py-1">
                                                    Max Marks
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {assessmentMeta.map(
                                                  (assess) => (
                                                    <tr key={assess.field}>
                                                      <td className="border px-2 py-1">
                                                        {assess.label}
                                                      </td>
                                                      <td className="border px-2 py-1">
                                                        <input
                                                          type="number"
                                                          min={0}
                                                          max={assess.max}
                                                          value={
                                                            form[
                                                              assess.field
                                                            ] ?? ""
                                                          }
                                                          onChange={(e) =>
                                                            setEditForm(
                                                              (prev) => ({
                                                                ...prev,
                                                                [`${course.course_id}_${student.student_id}`]:
                                                                  {
                                                                    ...prev[
                                                                      `${course.course_id}_${student.student_id}`
                                                                    ],
                                                                    [assess.field]:
                                                                      e.target
                                                                        .value,
                                                                  },
                                                              })
                                                            )
                                                          }
                                                          className="w-16 border px-1 py-0.5"
                                                        />
                                                      </td>
                                                      <td className="border px-2 py-1">
                                                        {assess.max}
                                                      </td>
                                                    </tr>
                                                  )
                                                )}
                                              </tbody>
                                            </table>
                                            <div className="flex gap-2">
                                              <button
                                                className="bg-gray-400 text-white px-3 py-1 rounded"
                                                onClick={() =>
                                                  handleCancelEdit(
                                                    course.course_id,
                                                    student.student_id
                                                  )
                                                }
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                                                onClick={() =>
                                                  handleUpdateGrades(
                                                    course.course_id,
                                                    student.student_id
                                                  )
                                                }
                                              >
                                                Update &amp; Save
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        ) : (
                          <p>No students enrolled in this course.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No assigned courses.</p>
      )}
    </div>
    </div>
  );
};

export default InstructorDashboard;