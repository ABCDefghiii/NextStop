import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CONFIG from "../config";

function Login({ setIsLoggedIn, setRole }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");

    const isAdmin = roleParam === "admin";
    const isDriver = roleParam === "driver";

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${CONFIG.BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.success) {
                // Use sessionStorage — per tab, won't affect other tabs
                sessionStorage.setItem("isLoggedIn", "true");
                sessionStorage.setItem("role", data.role);
                sessionStorage.setItem("username", username);

                // Driver specific
                if (data.role === "driver") {
                    sessionStorage.setItem("driverName", data.name);
                    sessionStorage.setItem("busNumber", data.busNumber);
                    sessionStorage.setItem("driverRoute", data.route);
                }

                // Student specific
                if (data.role === "student") {
                    sessionStorage.setItem("studentName", data.name);
                    sessionStorage.setItem("preferredRoute", data.preferredRoute);
                }

                setIsLoggedIn(true);
                setRole(data.role);

                if (data.role === "admin") navigate("/admin");
                else if (data.role === "driver") navigate("/driver");
                else navigate("/student");

            } else {
                setError("Invalid username or password.");
            }
        } catch (err) {
            setError("Server error. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const getTheme = () => {
        if (isAdmin) return {
            bg: "bg-gradient-to-br from-gray-900 via-green-950 to-emerald-900",
            glow1: "bg-green-500/10",
            glow2: "bg-emerald-500/10",
            btn: "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/30",
            icon: "🛠️",
            title: "Admin Login",
            subtitle: "Access the fleet management dashboard"
        };
        if (isDriver) return {
            bg: "bg-gradient-to-br from-gray-900 via-orange-950 to-amber-900",
            glow1: "bg-orange-500/10",
            glow2: "bg-amber-500/10",
            btn: "bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-orange-500/30",
            icon: "🧑‍✈️",
            title: "Driver Login",
            subtitle: "Start your trip and share your location"
        };
        return {
            bg: "bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-900",
            glow1: "bg-blue-500/10",
            glow2: "bg-indigo-500/10",
            btn: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/30",
            icon: "🎓",
            title: "Student Login",
            subtitle: "Track your bus in real-time"
        };
    };

    const theme = getTheme();

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden ${theme.bg}`}>

            <div className={`absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full blur-3xl ${theme.glow1}`} />
            <div className={`absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full blur-3xl ${theme.glow2}`} />

            <div className="w-full max-w-md z-10">

                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
                >
                    ← Back to Portal
                </button>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                    <div className="text-center mb-8">
                        <div className="text-5xl mb-3">{theme.icon}</div>
                        <h2 className="text-2xl font-bold text-white mb-1">{theme.title}</h2>
                        <p className="text-white/40 text-sm">{theme.subtitle}</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-white/60 text-xs mb-1 block">Username</label>
                            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
                                <span className="text-white/40 mr-3">👤</span>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-white/60 text-xs mb-1 block">Password</label>
                            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
                                <span className="text-white/40 mr-3">🔒</span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                            <p className="text-red-400 text-sm">⚠️ {error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200
                            ${loading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"}
                            ${theme.btn}`}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                </div>

                <p className="text-white/20 text-xs text-center mt-6">
                    NextStop © 2025 — AI-Powered Bus Tracking System
                </p>

            </div>
        </div>
    );
}

export default Login;
