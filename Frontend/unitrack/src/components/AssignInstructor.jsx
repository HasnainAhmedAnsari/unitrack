import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const AssignInstructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ instructor_id: "", course_id: "" });
  const [message, setMessage] = useState("");

  const fetchAll = async () => {
    const [iRes, cRes] = await Promise.all([
      axios.get("/instructors"),
      axios.get("/courses"),
    ]);
    setInstructors(iRes.data);
    setCourses(cRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/admins/assign-instructor", form);
      setMessage("Instructor assigned successfully!");
      setForm({ instructor_id: "", course_id: "" });
      fetchAll(); // Refresh to update assigned courses
    } catch (err) {
      setMessage(err.response?.data?.error || "Assignment failed");
    }
  };

  const handleCancel = () => {
    setForm({ instructor_id: "", course_id: "" });
    setMessage("");
  };

  // Helper: Check if course is already assigned
  const isAssigned = (course) => !!course.instructor_id;

  return (
    <section>
      <h2 className="text-xl font-semibold">Assign Instructor to Course</h2>
      <form onSubmit={handleAssign} className="flex gap-2 mt-2">
        <select
          value={form.instructor_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, instructor_id: e.target.value }))
          }
          className="border p-1 rounded"
          required
        >
          <option value="">Select Instructor</option>
          {instructors.map((i) => (
            <option key={i.instructor_id} value={i.instructor_id}>
              {i.instructor_name}
            </option>
          ))}
        </select>
        <select
          value={form.course_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, course_id: e.target.value }))
          }
          className="border p-1 rounded"
          required
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option
              key={c.course_id}
              value={c.course_id}
              disabled={isAssigned(c) && c.instructor_id !== form.instructor_id}
            >
              {c.title} ({c.code})
              {isAssigned(c)
                ? ` - Assigned to ${c.instructor_name || "Someone"}`
                : ""}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Assign
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-3 py-1 rounded"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </form>
      {message && <div className="mt-2 text-green-600">{message}</div>}
    </section>
  );
};

export default AssignInstructor;
