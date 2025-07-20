import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import "../index.css";

const LoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginUser({ id, password, role });
      console.log("Login response:", res.data); // ✅ Debug log
      if (res.data.success) {
        if (role === "admin") navigate("/admin");
        else navigate(`/${role}/${res.data.userId}`); // ✅ userId must be correct
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="flex flex-col items-center space-y-10 h-screen justify-center"
      style={{ backgroundColor: "#0f0f40", color: "#ffffff" }}
    >
    <div className="text-center">
        <h1 className=" font-bold text-blue-500" style={{ fontSize: "36px" }}>
          UniTrack
        </h1>
        <h2 className="text-2xl font-regular " style={{ fontSize: "18px" }}>Learning Management System</h2>
      </div>

    <div
    className="flex flex-col items-center space-y-8 justify-center py-12 px-6"
      style={{ backgroundColor: "#ffffff35", border: "1px solid white", borderRadius: "8px" }}
      >

      <h2 className="text-xl font-semibold capitalize">Login as {role}</h2>
     
     <div className="flex flex-col space-y-4">
      <input
        type="text"
        placeholder={role === "admin" ? "Username" : `${role} ID`}
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="border p-2 rounded w-64"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-64"
      />
</div>

      {error && <div className="text-red-500">{error}</div>}
      <button
        onClick={handleLogin}
        className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded"
      >
        Login
      </button>

    </div>

    </div>
  );
};

export default LoginPage;
