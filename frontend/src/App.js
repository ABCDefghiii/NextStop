import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Portal from "./pages/Portal";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

function App() {

  const [darkMode, setDarkMode] = useState(false);

  // DARK MODE
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
      {/* DARK MODE BUTTON */}
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

          {/* PORTAL */}
          <Route path="/" element={<Portal />} />

          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* STUDENT */}
          <Route
            path="/student"
            element={
              localStorage.getItem("isLoggedIn") === "true" &&
                localStorage.getItem("role") === "student"
                ? <StudentDashboard />
                : <Navigate to="/login?role=student" />
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              localStorage.getItem("isLoggedIn") === "true" &&
                localStorage.getItem("role") === "admin"
                ? <AdminDashboard />
                : <Navigate to="/login?role=admin" />
            }
          />

        </Routes>
      </Router>
    </>
  );
}

export default App;