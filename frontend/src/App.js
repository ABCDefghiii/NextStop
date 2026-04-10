import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Portal from "./pages/Portal";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

function App() {

  const [darkMode, setDarkMode] = useState(false);

  // 🔹 Auth State (optimized)
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  // 🔹 Dark Mode Effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // 🔹 Reusable Protected Route
  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!isLoggedIn || role !== allowedRole) {
      return <Navigate to={`/login?role=${allowedRole}`} />;
    }
    return children;
  };

  return (
    <>
      {/* 🔹 DARK MODE BUTTON */}
      <button
        onClick={() => setDarkMode(prev => !prev)}
        className="fixed top-4 right-4 z-[3000] 
        bg-gray-800 text-white 
        dark:bg-white dark:text-black 
        px-4 py-2 rounded-lg shadow-lg 
        hover:scale-105 transition"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <Router>
        <Routes>

          {/* 🔹 PORTAL */}
          <Route path="/" element={<Portal />} />

          {/* 🔹 LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* 🔹 STUDENT DASHBOARD */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🔹 ADMIN DASHBOARD */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🔹 FALLBACK ROUTE */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;