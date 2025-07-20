import React, { useState } from "react";
import StudentCRUD from "../components/StudentCRUD";
import InstructorCRUD from "../components/InstructorCRUD";
import CourseCRUD from "../components/CourseCRUD";
import DepartmentCRUD from "../components/DepartmentCRUD";
import AssignInstructor from "../components/AssignInstructor";
import EnrollmentHistory from "../components/EnrollmentHistory";
import { useNavigate } from "react-router-dom";

const sections = [
  { key: "departments", label: "Departments", component: <DepartmentCRUD /> },
  { key: "students", label: "Students", component: <StudentCRUD /> },
  { key: "instructors", label: "Instructors", component: <InstructorCRUD /> },
  { key: "courses", label: "Courses", component: <CourseCRUD /> },
  {
    key: "assign",
    label: "Assign Instructor",
    component: <AssignInstructor />,
  },
  {
    key: "enrollments",
    label: "Enrollment History",
    component: <EnrollmentHistory />,
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("departments");

  return (
    <div>
      <div
        className="flex py-4 px-12 justify-between items-center rounded shadow"
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
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`px-4 py-2 rounded font-semibold ${
                activeSection === section.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded shadow p-4">
          {sections.find((s) => s.key === activeSection)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
