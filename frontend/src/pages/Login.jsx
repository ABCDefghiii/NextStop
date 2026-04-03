import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const location = useLocation();
    const navigate = useNavigate();

    // 📌 Get role from URL (?role=student or admin)
    const params = new URLSearchParams(location.search);
    const role = params.get("role");
    console.log("ROLE:", role);
    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.success) {
                // ✅ Store login state
                localStorage.setItem("isLoggedIn", "true");

                // ✅ Store role from portal selection
                localStorage.setItem("role", role);

                // ✅ Redirect based on role
                if (role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/student");
                }
            } else {
                setError("Invalid username or password");
            }
        } catch (err) {
            setError("Server error");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">

            <div className="bg-white p-8 rounded-2xl shadow-lg w-80">

                {/* ✅ Dynamic Heading */}
                <h2 className="text-2xl font-bold mb-4 text-center">
                    {role === "admin" ? "🔐 Admin Login" : "🎓 Student Login"}
                </h2>

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full mb-3 p-2 border rounded"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-3 p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <p className="text-red-500 text-sm mb-2">{error}</p>
                )}

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Login
                </button>

            </div>
        </div>
    );
}

export default Login;