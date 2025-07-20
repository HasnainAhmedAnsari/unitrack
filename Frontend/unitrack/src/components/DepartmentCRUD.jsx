import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const DepartmentCRUD = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ department_name: "", building: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchDepartments = async () => {
    const res = await axios.get("/departments");
    setDepartments(res.data);
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/departments/${editingId}`, form);
    } else {
      await axios.post("/departments", form);
    }
    setForm({ department_name: "", building: "" });
    setEditingId(null);
    fetchDepartments();
  };

  const handleEdit = (dep) => {
    setForm({ department_name: dep.department_name, building: dep.building });
    setEditingId(dep.department_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this department?")) {
      await axios.delete(`/departments/${id}`);
      fetchDepartments();
    }
  };

  const handleCancel = () => {
    setForm({ department_name: "", building: "" });
    setEditingId(null);
  };

  return (
    <section>
      <h2 className="text-xl font-semibold">Departments</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2 flex-wrap">
        <input
          placeholder="Department Name"
          value={form.department_name}
          onChange={e => setForm(f => ({ ...f, department_name: e.target.value }))}
          className="border p-1 rounded"
          required
        />
        <input
          placeholder="Building Location"
          value={form.building}
          onChange={e => setForm(f => ({ ...f, building: e.target.value }))}
          className="border p-1 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
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
            <th className="border px-2 py-1">Department Name</th>
            <th className="border px-2 py-1">Location</th>
            <th className="border px-2 py-1">No. of Instructors</th>
            <th className="border px-2 py-1">No. of Courses</th>
            <th className="border px-2 py-1">No. of Students</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(dep => (
            <tr key={dep.department_id}>
              <td className="border px-2 py-1">{dep.department_id}</td>
              <td className="border px-2 py-1">{dep.department_name}</td>
              <td className="border px-2 py-1">{dep.building}</td>
              <td className="border px-2 py-1 text-center">{dep.instructor_count}</td>
              <td className="border px-2 py-1 text-center">{dep.course_count}</td>
              <td className="border px-2 py-1 text-center">{dep.student_count}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleEdit(dep)}
                  className="bg-yellow-400 px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dep.department_id)}
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

export default DepartmentCRUD;