import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CONFIG from "../config";

function Login({ setIsLoggedIn, setRole }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");

    const isAdmin = roleParam === "admin";
    const isDriver = roleParam === "driver";

    // Particle canvas — matches Portal.jsx
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.4 + 0.1,
        }));

        let animId;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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
                sessionStorage.setItem("isLoggedIn", "true");
                sessionStorage.setItem("role", data.role);
                sessionStorage.setItem("username", username);
                if (data.role === "driver") {
                    sessionStorage.setItem("driverName", data.name);
                    sessionStorage.setItem("busNumber", data.busNumber);
                    sessionStorage.setItem("driverRoute", data.route);
                }
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
        } catch {
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getTheme = () => {
        if (isAdmin) return {
            icon: "🛠️",
            label: "Admin",
            title: "Welcome back",
            subtitle: "Access the fleet management dashboard",
            accent: "#22C55E",
            glow: "rgba(34,197,94,0.3)",
            border: "rgba(34,197,94,0.25)",
            badgeBg: "rgba(34,197,94,0.12)",
            badgeColor: "#86EFAC",
            btnGrad: "linear-gradient(135deg,#22C55E,#16A34A)",
            blob1: "rgba(34,197,94,0.08)",
            blob2: "rgba(16,185,129,0.06)",
        };
        if (isDriver) return {
            icon: "🧑‍✈️",
            label: "Driver",
            title: "Welcome back",
            subtitle: "Start your trip and share your location",
            accent: "#F97316",
            glow: "rgba(249,115,22,0.3)",
            border: "rgba(249,115,22,0.25)",
            badgeBg: "rgba(249,115,22,0.12)",
            badgeColor: "#FED7AA",
            btnGrad: "linear-gradient(135deg,#F97316,#EA580C)",
            blob1: "rgba(249,115,22,0.08)",
            blob2: "rgba(234,88,12,0.06)",
        };
        return {
            icon: "🎓",
            label: "Student",
            title: "Welcome back",
            subtitle: "Track your bus in real-time",
            accent: "#3B82F6",
            glow: "rgba(59,130,246,0.3)",
            border: "rgba(59,130,246,0.25)",
            badgeBg: "rgba(59,130,246,0.12)",
            badgeColor: "#93C5FD",
            btnGrad: "linear-gradient(135deg,#3B82F6,#6366F1)",
            blob1: "rgba(59,130,246,0.1)",
            blob2: "rgba(99,102,241,0.08)",
        };
    };

    const t = getTheme();

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg,#0A0F1E 0%,#0D1B3E 40%,#0F1E3A 70%,#0A0F1E 100%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "2.5rem 1.5rem",
            position: "relative", overflow: "hidden",
            fontFamily: "'Sora','Outfit',sans-serif",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
                @keyframes floatIcon { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                @keyframes borderGlow { 0%,100%{opacity:.4} 50%{opacity:.9} }

                .login-field-wrap {
                    display:flex; align-items:center; gap:10px;
                    background:rgba(255,255,255,0.05);
                    border:1px solid rgba(255,255,255,0.09);
                    border-radius:14px; padding:14px 16px;
                    transition:border-color .2s, background .2s;
                    margin-bottom:16px;
                }
                .login-field-wrap:focus-within {
                    border-color:${t.accent};
                    background:rgba(255,255,255,0.07);
                }
                .login-field-input {
                    flex:1; background:none; border:none; outline:none;
                    color:#F0F6FF; font-size:14px;
                    font-family:'Sora',sans-serif; font-weight:400;
                }
                .login-field-input::placeholder { color:rgba(255,255,255,0.2); }

                .login-btn {
                    width:100%; padding:15px; border:none; border-radius:14px;
                    font-size:14px; font-weight:700; color:#fff; cursor:pointer;
                    letter-spacing:.04em; text-transform:uppercase;
                    transition:transform .2s, box-shadow .2s, opacity .2s;
                    font-family:'Sora',sans-serif;
                    background:${t.btnGrad};
                }
                .login-btn:hover:not(:disabled) {
                    transform:translateY(-2px) scale(1.01);
                    box-shadow:0 12px 40px ${t.glow};
                }
                .login-btn:active { transform:scale(.98); }
                .login-btn:disabled { opacity:.55; cursor:not-allowed; }

                .back-btn-login {
                    display:flex; align-items:center; gap:6px;
                    color:rgba(147,197,253,0.45); font-size:13px; font-weight:400;
                    background:none; border:none; cursor:pointer;
                    transition:color .2s; margin-bottom:28px;
                    font-family:'Sora',sans-serif; letter-spacing:.02em;
                }
                .back-btn-login:hover { color:rgba(147,197,253,0.9); }

                .title-shimmer-login {
                    background:linear-gradient(90deg,#E0EEFF 30%,#93C5FD 50%,#E0EEFF 70%);
                    background-size:200% auto;
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                    background-clip:text; animation:shimmer 4s linear infinite;
                }
            `}</style>

            {/* Particle canvas */}
            <canvas ref={canvasRef} style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0
            }} />

            {/* Ambient blobs */}
            <div style={{
                position: "absolute", top: "-100px", right: "-100px",
                width: "400px", height: "400px", borderRadius: "50%",
                background: `radial-gradient(circle,${t.blob1} 0%,transparent 70%)`,
                pointerEvents: "none", zIndex: 0,
            }} />
            <div style={{
                position: "absolute", bottom: "-100px", left: "-100px",
                width: "350px", height: "350px", borderRadius: "50%",
                background: `radial-gradient(circle,${t.blob2} 0%,transparent 70%)`,
                pointerEvents: "none", zIndex: 0,
            }} />

            {/* Content */}
            <div style={{
                width: "100%", maxWidth: "400px",
                zIndex: 1, position: "relative",
                animation: "fadeUp .7s ease forwards",
            }}>
                {/* Back button */}
                <button className="back-btn-login" onClick={() => navigate("/")}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M13 8H3M7 12l-4-4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Portal
                </button>

                {/* Card */}
                <div style={{
                    background: "rgba(255,255,255,0.035)",
                    border: `1px solid rgba(255,255,255,0.09)`,
                    borderRadius: "24px", padding: "40px 36px 36px",
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset",
                    position: "relative", overflow: "hidden",
                }}>
                    {/* Glow ring */}
                    <div style={{
                        position: "absolute", inset: "-1px", borderRadius: "25px",
                        border: `1px solid ${t.border}`,
                        animation: "borderGlow 3s ease-in-out infinite",
                        pointerEvents: "none",
                    }} />

                    {/* Icon */}
                    <div style={{ textAlign: "center", marginBottom: "28px" }}>
                        <div style={{
                            width: "70px", height: "70px", borderRadius: "20px",
                            background: `linear-gradient(135deg,${t.glow.replace("0.3", "0.18")},rgba(255,255,255,0.05))`,
                            border: `1px solid ${t.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "30px", margin: "0 auto 18px",
                            animation: "floatIcon 3.5s ease-in-out infinite",
                            boxShadow: `0 0 28px ${t.glow}`,
                        }}>
                            {t.icon}
                        </div>

                        {/* Role badge */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "4px 14px", borderRadius: "100px",
                            background: t.badgeBg,
                            border: `1px solid ${t.border}`,
                            color: t.badgeColor,
                            fontSize: "11px", fontWeight: 700,
                            letterSpacing: ".07em", textTransform: "uppercase",
                            marginBottom: "14px",
                        }}>
                            <span style={{
                                width: "5px", height: "5px", borderRadius: "50%",
                                background: t.accent,
                                boxShadow: `0 0 6px ${t.accent}`,
                                display: "inline-block",
                            }} />
                            {t.label}
                        </div>

                        <h2 className="title-shimmer-login" style={{
                            fontSize: "26px", fontWeight: 800,
                            letterSpacing: "-.02em", margin: "0 0 6px",
                        }}>
                            {t.title}
                        </h2>
                        <p style={{
                            color: "rgba(148,163,184,0.55)",
                            fontSize: "13px", fontWeight: 300,
                            letterSpacing: ".01em",
                        }}>
                            {t.subtitle}
                        </p>
                    </div>

                    {/* Fields */}
                    <div style={{ marginTop: "28px" }}>
                        <label style={{
                            color: "rgba(147,197,253,0.6)", fontSize: "11px",
                            fontWeight: 600, letterSpacing: ".05em",
                            textTransform: "uppercase", display: "block", marginBottom: "6px",
                        }}>Username</label>
                        <div className="login-field-wrap">
                            <span style={{ fontSize: "16px", opacity: .5 }}>👤</span>
                            <input
                                className="login-field-input"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            />
                        </div>

                        <label style={{
                            color: "rgba(147,197,253,0.6)", fontSize: "11px",
                            fontWeight: 600, letterSpacing: ".05em",
                            textTransform: "uppercase", display: "block", marginBottom: "6px",
                        }}>Password</label>
                        <div className="login-field-wrap">
                            <span style={{ fontSize: "16px", opacity: .5 }}>🔒</span>
                            <input
                                className="login-field-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: "12px", padding: "10px 14px",
                            marginBottom: "16px",
                            display: "flex", alignItems: "center", gap: "8px",
                            fontSize: "13px", color: "#FCA5A5",
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{
                        height: "1px", background: "rgba(255,255,255,0.06)",
                        margin: "24px 0",
                    }} />

                    {/* Submit */}
                    <button
                        className="login-btn"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : `Sign in as ${t.label} →`}
                    </button>

                    <p style={{
                        textAlign: "center", color: "rgba(147,197,253,0.3)",
                        fontSize: "12px", marginTop: "16px", fontWeight: 300,
                    }}>
                        Secure session — closes when tab closes
                    </p>
                </div>

                <p style={{
                    color: "rgba(255,255,255,0.12)", fontSize: "11px",
                    textAlign: "center", marginTop: "24px",
                    letterSpacing: ".04em", fontWeight: 300,
                }}>
                    NextStop © 2026 — AI-Powered Bus Tracking System
                </p>
            </div>
        </div>
    );
}

export default Login;
