import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const EnrollmentHistory = () => {
  const [enrollments, setEnrollments] = useState([]);

  const fetchEnrollments = async () => {
    const res = await axios.get("/admins/enrollments");
    setEnrollments(res.data);
  };

  useEffect(() => { fetchEnrollments(); }, []);

  return (
    <section>
      <h2 className="text-xl font-semibold">Enrollment History</h2>
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Student ID</th>
            <th className="border px-2 py-1">Student Name</th>
            <th className="border px-2 py-1">Course ID</th>
            <th className="border px-2 py-1">Course Name</th>
            <th className="border px-2 py-1">Assigned Instructor</th>
            <th className="border px-2 py-1">Enrollment Date</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map(e => (
            <tr key={`${e.student_id}_${e.course_id}`}>
              <td className="border px-2 py-1">{e.student_id}</td>
              <td className="border px-2 py-1">{e.student_name}</td>
              <td className="border px-2 py-1">{e.course_id}</td>
              <td className="border px-2 py-1">{e.course_title}</td>
              <td className="border px-2 py-1">
                {e.instructor_name ? e.instructor_name : "Not assigned"}
              </td>
              <td className="border px-2 py-1">
                {e.enroll_date
                  ? new Date(e.enroll_date).toLocaleDateString()
                  : ""}
              </td>
              <td className="border px-2 py-1">
                {e.status || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default EnrollmentHistory;