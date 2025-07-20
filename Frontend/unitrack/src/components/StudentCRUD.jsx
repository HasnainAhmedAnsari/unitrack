import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const StudentCRUD = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    student_name: "",
    email: "",
    dob: "",
    department_id: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch students and departments
  const fetchAll = async () => {
    const [sRes, dRes] = await Promise.all([
      axios.get("/students"),
      axios.get("/departments"),
    ]);
    setStudents(sRes.data);
    setDepartments(dRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Handle form submit for add/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/students/${editingId}`, form);
    } else {
      await axios.post("/students", form);
    }
    setForm({ student_name: "", email: "", dob: "", department_id: "" });
    setEditingId(null);
    fetchAll();
  };

  // Edit student
  const handleEdit = (student) => {
    setForm({
      student_name: student.student_name,
      email: student.email,
      dob: student.dob ? student.dob.split("T")[0] : "",
      department_id: student.department_id || "",
    });
    setEditingId(student.student_id);
  };

  // Delete student
  const handleDelete = async (id) => {
    if (window.confirm("Delete this student?")) {
      await axios.delete(`/students/${id}`);
      fetchAll();
    }
  };

  const handleCancel = () => {
  setForm({
    student_name: "",
    email: "",
    dob: "",
    department_id: "",
  });
  setEditingId(null);
};

  return (
    <section>
      <h2 className="text-xl font-semibold">Students</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mt-2">
        <input
          placeholder="Name"
          value={form.student_name}
          onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))}
          className="border p-1 rounded"
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="border p-1 rounded"
          required
        />
        <input
          placeholder="Date of Birth"
          type="date"
          value={form.dob}
          onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
          className="border p-1 rounded"
          required
        />
        <select
          value={form.department_id}
          onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
          className="border p-1 rounded"
          required
        >
          <option value="">Select Department</option>
          {departments.map(d => (
            <option key={d.department_id} value={d.department_id}>
              {d.department_name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
          <button
    type="button"
    className="bg-gray-400 text-white px-3 py-1 rounded"
    onClick={handleCancel}
  >
    Cancel
  </button>
      </form>
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Date of Birth</th>
            <th className="border px-2 py-1">Department</th>
            <th className="border px-2 py-1">No. of Courses Enrolled</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.student_id}>
              <td className="border px-2 py-1">{s.student_id}</td>
              <td className="border px-2 py-1">{s.student_name}</td>
              <td className="border px-2 py-1">{s.email}</td>
              <td className="border px-2 py-1">{s.dob ? s.dob.split("T")[0] : ""}</td>
              <td className="border px-2 py-1">{s.department_name || "-"}</td>
              <td className="border px-2 py-1 text-center">{s.courses_enrolled}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleEdit(s)}
                  className="bg-yellow-400 px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.student_id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default StudentCRUD;