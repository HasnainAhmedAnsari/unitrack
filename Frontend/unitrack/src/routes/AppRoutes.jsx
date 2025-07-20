// src/routes/AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelection from "../pages/RoleSelection";
import LoginPage from "../pages/LoginPage";
import StudentDashboard from "../pages/StudentDashboard";
import InstructorDashboard from "../pages/InstructorDashboard";
import AdminDashboard from "../pages/AdminDashboard";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/student/:id" element={<StudentDashboard />} />
        <Route path="/instructor/:id" element={<InstructorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />{" "}
      </Routes>
    </Router>
  );
}

export default AppRoutes;

