// // src/pages/RoleSelection.jsx
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center space-y-16 h-screen justify-center"
      style={{ backgroundColor: "#0f0f40", color: "#ffffff" }}
    >
      <div className="text-center">
        <h1 className=" font-bold text-blue-500" style={{ fontSize: "64px" }}>
          UniTrack
        </h1>
        <h2 className="text-2xl font-regular ">Learning Management System</h2>
      </div>

      <div className="text-center space-y-6">
        <div className="text-2xl font-bold">Continue As</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["admin", "student", "instructor"].map((role) => (
            <div
              key={role}
              onClick={() => navigate(`/login/${role}`)}
              className="bg-blue-500 text-white py-6 px-10 rounded-lg shadow-md hover:bg-blue-600 cursor-pointer"
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
