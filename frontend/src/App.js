import React, { useState, useEffect } from "react";
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

  // DARK MODE
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // CROSS-TAB SYNC
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;