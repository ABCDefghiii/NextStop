import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Portal from "./pages/Portal";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [role, setRole] = useState(
    localStorage.getItem("role") || ""
  );

  // 🔹 Auth State (memoized for safety)
  const isLoggedIn = useMemo(
    () => localStorage.getItem("isLoggedIn") === "true",
    []
  );

  const role = localStorage.getItem("role");

  // 🔹 Dark Mode Effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

<<<<<<< HEAD
  // LISTEN FOR LOGIN CHANGES (cross-tab sync)
  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setRole(localStorage.getItem("role") || "");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <>
=======
  // 🔹 Protected Route Component
  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!isLoggedIn || role !== allowedRole) {
      return <Navigate to={`/login?role=${allowedRole}`} replace />;
    }
    return children;
  };

  return (
    <>
      {/* 🔹 DARK MODE TOGGLE */}
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className="fixed top-4 right-4 z-[3000]
        bg-gray-800 text-white
        dark:bg-white dark:text-black
        px-4 py-2 rounded-lg shadow-lg
        hover:scale-105 transition"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <Router>
        <Routes>
<<<<<<< HEAD
          <Route path="/" element={<Portal />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} setRole={setRole} />}
          />
          <Route
            path="/student"
            element={
              isLoggedIn && role === "student"
                ? <StudentDashboard setIsLoggedIn={setIsLoggedIn} setRole={setRole} />
                : <Navigate to="/login?role=student" />
            }
          />
          <Route
            path="/admin"
            element={
              isLoggedIn && role === "admin"
                ? <AdminDashboard setIsLoggedIn={setIsLoggedIn} setRole={setRole} />
                : <Navigate to="/login?role=admin" />
            }
          />
=======

          {/* 🔹 HOME / PORTAL */}
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

          {/* 🔹 FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f
        </Routes>
      </Router>
    </>
  );
}

export default App;