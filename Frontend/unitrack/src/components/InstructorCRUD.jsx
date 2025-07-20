import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const InstructorCRUD = () => {
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    instructor_name: "",
    email: "",
    department_id: "",
    salary: "",
    faculty_type: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchAll = async () => {
    const [iRes, dRes] = await Promise.all([
      axios.get("/instructors"),
      axios.get("/departments"),
    ]);
    setInstructors(iRes.data);
    setDepartments(dRes.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/instructors/${editingId}`, form);
    } else {
      await axios.post("/instructors", form);
    }
    setForm({
      instructor_name: "",
      email: "",
      department_id: "",
      salary: "",
      faculty_type: "",
    });
    setEditingId(null);
    fetchAll();
  };

  const handleEdit = (inst) => {
    setForm({
      instructor_name: inst.instructor_name,
      email: inst.email,
      department_id: inst.department_id || "",
      salary: inst.salary,
      faculty_type: inst.faculty_type,
    });
    setEditingId(inst.instructor_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this instructor?")) {
      await axios.delete(`/instructors/${id}`);
      fetchAll();
    }
  };

  const handleCancel = () => {
  setForm({
    instructor_name: "",
    email: "",
    department_id: "",
    salary: "",
    faculty_type: "",
  });
  setEditingId(null);
};

  return (
    <section>
      <h2 className="text-xl font-semibold">Instructors</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mt-2">
        <input
          placeholder="Name"
          value={form.instructor_name}
          onChange={e => setForm(f => ({ ...f, instructor_name: e.target.value }))}
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
          placeholder="Salary"
          type="number"
          min="0"
          step="0.01"
          value={form.salary}
          onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
          className="border p-1 rounded"
          required
        />
        <select
          value={form.faculty_type}
          onChange={e => setForm(f => ({ ...f, faculty_type: e.target.value }))}
          className="border p-1 rounded"
          required
        >
          <option value="">Select Faculty Type</option>
          <option value="Permanent Faculty">Permanent Faculty</option>
          <option value="Visiting Faculty">Visiting Faculty</option>
        </select>
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
            <th className="border px-2 py-1">Salary</th>
            <th className="border px-2 py-1">Faculty Type</th>
            <th className="border px-2 py-1">Department</th>
            <th className="border px-2 py-1">No. of Courses Teaches</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map(i => (
            <tr key={i.instructor_id}>
              <td className="border px-2 py-1">{i.instructor_id}</td>
              <td className="border px-2 py-1">{i.instructor_name}</td>
              <td className="border px-2 py-1">{i.email}</td>
              <td className="border px-2 py-1">{i.salary}</td>
              <td className="border px-2 py-1">{i.faculty_type}</td>
              <td className="border px-2 py-1">{departments.find(d => d.department_id === i.department_id)?.department_name || "-"}</td>
              <td className="border px-2 py-1 text-center">{i.courses_teaches}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleEdit(i)}
                  className="bg-yellow-400 px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(i.instructor_id)}
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

export default InstructorCRUD;