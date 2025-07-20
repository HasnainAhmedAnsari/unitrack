import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const CourseCRUD = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    title: "",
    code: "",
    credits: "",
    availability: "Open",
    department_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showAvailabilityOnly, setShowAvailabilityOnly] = useState(false);

  const fetchAll = async () => {
    const [cRes, dRes] = await Promise.all([
      axios.get("/courses"),
      axios.get("/departments"),
    ]);
    setCourses(cRes.data);
    setDepartments(dRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Handle add/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/courses/${editingId}`, form);
    } else {
      await axios.post("/courses", form);
    }
    resetForm();
    fetchAll();
  };

  // Edit course (full form)
  const handleEdit = (course) => {
    setShowAvailabilityOnly(false);
    setForm({
      title: course.title,
      code: course.code,
      credits: course.credits,
      availability: course.availability,
      department_id: course.department_id,
    });
    setEditingId(course.course_id);
  };

  // Edit only availability
  const handleEditAvailability = (course) => {
    setShowAvailabilityOnly(true);
    setForm({
      ...form,
      availability: course.availability,
    });
    setEditingId(course.course_id);
  };

  // Save only availability
  const handleSubmitAvailability = async (e) => {
    e.preventDefault();
    await axios.put(`/courses/${editingId}/availability`, {
      availability: form.availability,
    });
    resetForm();
    fetchAll();
  };

  // Delete course
  const handleDelete = async (id) => {
    if (window.confirm("Delete this course?")) {
      await axios.delete(`/courses/${id}`);
      fetchAll();
    }
  };

  // Reset/Clear form
  const resetForm = () => {
    setForm({
      title: "",
      code: "",
      credits: "",
      availability: "Open",
      department_id: "",
    });
    setEditingId(null);
    setShowAvailabilityOnly(false);
  };

  return (
    <section>
      <h2 className="text-xl font-semibold">Courses</h2>
      {/* Form for Add/Update */}
      <form
        onSubmit={
          showAvailabilityOnly ? handleSubmitAvailability : handleSubmit
        }
        className="flex gap-2 mt-2 flex-wrap"
      >
        {!showAvailabilityOnly && (
          <>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="border p-1 rounded"
              required
            />
            <input
              placeholder="Code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="border p-1 rounded"
              required
            />
            <input
              placeholder="Credits"
              type="number"
              min="1"
              value={form.credits}
              onChange={(e) =>
                setForm((f) => ({ ...f, credits: e.target.value }))
              }
              className="border p-1 rounded"
              required
            />
            <select
              value={form.department_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, department_id: e.target.value }))
              }
              className="border p-1 rounded"
              required
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </>
        )}
        <select
          value={form.availability}
          onChange={(e) =>
            setForm((f) => ({ ...f, availability: e.target.value }))
          }
          className="border p-1 rounded"
          required
        >
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {editingId
            ? showAvailabilityOnly
              ? "Update Availability"
              : "Update"
            : "Add"}
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-3 py-1 rounded"
          onClick={resetForm}
        >
          Cancel
        </button>
      </form>
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Title</th>
            <th className="border px-2 py-1">Code</th>
            <th className="border px-2 py-1">Credits</th>
            <th className="border px-2 py-1">Availability</th>
            <th className="border px-2 py-1">Department</th>
            <th className="border px-2 py-1">Assigned Instructor</th>
            <th className="border px-2 py-1">No. of Students Enrolled</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.course_id}>
              <td className="border px-2 py-1">{c.course_id}</td>
              <td className="border px-2 py-1">{c.title}</td>
              <td className="border px-2 py-1">{c.code}</td>
              <td className="border px-2 py-1">{c.credits}</td>
              <td className="border px-2 py-1">
                <span
                  className={
                    c.availability.toLowerCase() === "open"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {c.availability.charAt(0).toUpperCase() +
                    c.availability.slice(1).toLowerCase()}
                </span>
              </td>
              <td className="border px-2 py-1">
                {departments.find((d) => d.department_id === c.department_id)
                  ?.department_name || "-"}
              </td>
              <td className="border px-2 py-1">
                {c.instructor_name || "Not Assigned"}
              </td>
              <td className="border px-2 py-1 text-center">
                {c.students_enrolled}
              </td>
              <td className="border px-2 py-1 flex gap-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.course_id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEditAvailability(c)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Set Availability
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default CourseCRUD;
