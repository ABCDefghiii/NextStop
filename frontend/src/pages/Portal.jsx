import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Portal() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 60 }, () => ({
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

    const roles = [
        {
            key: "student",
            icon: "🎓",
            label: "Student",
            desc: "Track your bus live, get AI-powered ETA predictions and chat with Navis AI assistant.",
            cta: "Student Login",
            accent: "#3B82F6",
            glow: "rgba(59,130,246,0.25)",
            border: "rgba(59,130,246,0.35)",
            tag: "Most Used",
            tagBg: "rgba(59,130,246,0.15)",
            tagColor: "#93C5FD",
        },
        {
            key: "driver",
            icon: "🚌",
            label: "Driver",
            desc: "Start your trip and broadcast your live location to students in real-time with one tap.",
            cta: "Driver Login",
            accent: "#F97316",
            glow: "rgba(249,115,22,0.25)",
            border: "rgba(249,115,22,0.35)",
            tag: null,
            tagBg: null,
            tagColor: null,
        },
        {
            key: "admin",
            icon: "🛠️",
            label: "Admin",
            desc: "Monitor your fleet, view analytics dashboards, manage routes and oversee all bus activity.",
            cta: "Admin Login",
            accent: "#22C55E",
            glow: "rgba(34,197,94,0.25)",
            border: "rgba(34,197,94,0.35)",
            tag: null,
            tagBg: null,
            tagColor: null,
        },
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 40%, #0F1E3A 70%, #0A0F1E 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1.5rem",
                position: "relative",
                overflow: "hidden",
                fontFamily: "'Sora', 'Outfit', sans-serif",
            }}
        >
            {/* Google Font */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes subtlePulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.04); }
                }
                @keyframes rotateSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }

                .portal-card {
                    transition: transform 0.32s cubic-bezier(.22,1,.36,1), box-shadow 0.32s ease, border-color 0.32s ease, background 0.32s ease;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                .portal-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transition: opacity 0.32s ease;
                    pointer-events: none;
                    border-radius: inherit;
                }
                .portal-card:hover {
                    transform: translateY(-6px) scale(1.015);
                }
                .portal-card:hover::before { opacity: 1; }

                .cta-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    transition: gap 0.2s ease;
                }
                .portal-card:hover .cta-row { gap: 10px; }

                .badge-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid;
                    opacity: 0.07;
                    pointer-events: none;
                }

                .icon-wrapper {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin-bottom: 18px;
                    position: relative;
                }

                .logo-bus {
                    animation: subtlePulse 3s ease-in-out infinite;
                    display: inline-block;
                    font-size: 52px;
                    filter: drop-shadow(0 0 18px rgba(59,130,246,0.5));
                }

                .title-shimmer {
                    background: linear-gradient(90deg, #E0EEFF 30%, #93C5FD 50%, #E0EEFF 70%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }

                .divider-dot {
                    width: 4px; height: 4px;
                    border-radius: 50%;
                    background: rgba(147,197,253,0.4);
                    display: inline-block;
                    margin: 0 10px;
                }

                .stat-chip {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 6px 14px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 100px;
                    font-size: 12px;
                    color: rgba(147,197,253,0.8);
                    font-weight: 500;
                    letter-spacing: 0.02em;
                }
                .stat-chip .dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #22C55E;
                    box-shadow: 0 0 6px #22C55E;
                    flex-shrink: 0;
                }
            `}</style>

            {/* Animated Particle Canvas */}
            <canvas
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
            />

            {/* Ambient glow blobs */}
            <div style={{
                position: "absolute", top: "-120px", left: "-120px",
                width: "500px", height: "500px",
                background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
                pointerEvents: "none", zIndex: 0,
            }} />
            <div style={{
                position: "absolute", bottom: "-120px", right: "-80px",
                width: "450px", height: "450px",
                background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
                pointerEvents: "none", zIndex: 0,
            }} />
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: "800px", height: "400px",
                background: "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 65%)",
                pointerEvents: "none", zIndex: 0,
            }} />

            {/* Hero Section */}
            <div style={{
                textAlign: "center", marginBottom: "52px", zIndex: 1, position: "relative",
                animation: "fadeUp 0.8s ease forwards",
            }}>
                {/* Live status chip */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
                    <div className="stat-chip">
                        <span className="dot" />
                        System Online — Real-time tracking active
                    </div>
                </div>

                <div className="logo-bus">🚌</div>

                <h1
                    className="title-shimmer"
                    style={{
                        fontSize: "clamp(42px, 7vw, 72px)",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        margin: "12px 0 0",
                        lineHeight: 1.05,
                    }}
                >
                    NextStop
                </h1>

                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexWrap: "wrap", gap: "4px",
                    marginTop: "16px",
                }}>
                    {["AI-Powered", "Real-Time Tracking", "Smart ETAs"].map((item, i) => (
                        <span key={i} style={{ display: "flex", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", color: "rgba(147,197,253,0.7)", fontWeight: 400, letterSpacing: "0.02em" }}>
                                {item}
                            </span>
                            {i < 2 && <span className="divider-dot" />}
                        </span>
                    ))}
                </div>

                <p style={{
                    color: "rgba(148,163,184,0.65)",
                    fontSize: "14px",
                    marginTop: "12px",
                    fontWeight: 300,
                    letterSpacing: "0.01em",
                }}>
                    Select your role to get started
                </p>
            </div>

            {/* Role Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
                width: "100%",
                maxWidth: "960px",
                zIndex: 1, position: "relative",
                animation: "fadeUp 0.9s ease 0.15s both forwards",
            }}>
                {roles.map((role) => (
                    <button
                        key={role.key}
                        className="portal-card"
                        onClick={() => navigate(`/login?role=${role.key}`)}
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid rgba(255,255,255,0.08)`,
                            borderRadius: "20px",
                            padding: "32px 28px 28px",
                            textAlign: "left",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0",
                            boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = role.border;
                            e.currentTarget.style.boxShadow = `0 20px 60px ${role.glow}, 0 1px 0 rgba(255,255,255,0.08) inset`;
                            e.currentTarget.style.background = `rgba(255,255,255,0.05)`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                            e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.05) inset";
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        }}
                    >
                        {/* Tag */}
                        {role.tag && (
                            <div style={{
                                position: "absolute", top: "16px", right: "16px",
                                background: role.tagBg,
                                color: role.tagColor,
                                fontSize: "10px", fontWeight: 700,
                                letterSpacing: "0.08em", textTransform: "uppercase",
                                padding: "4px 10px", borderRadius: "100px",
                                border: `1px solid ${role.border}`,
                            }}>
                                {role.tag}
                            </div>
                        )}

                        {/* Decorative rings */}
                        <div className="badge-ring" style={{
                            width: "180px", height: "180px",
                            top: "-60px", right: "-60px",
                            borderColor: role.accent,
                        }} />
                        <div className="badge-ring" style={{
                            width: "120px", height: "120px",
                            top: "-30px", right: "-30px",
                            borderColor: role.accent,
                        }} />

                        {/* Icon */}
                        <div className="icon-wrapper" style={{
                            background: `linear-gradient(135deg, ${role.accent}22, ${role.accent}10)`,
                            border: `1px solid ${role.accent}33`,
                        }}>
                            <span style={{ fontSize: "24px" }}>{role.icon}</span>
                            <div style={{
                                position: "absolute",
                                inset: 0, borderRadius: "14px",
                                boxShadow: `0 0 20px ${role.glow}`,
                            }} />
                        </div>

                        {/* Label */}
                        <h2 style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#F0F6FF",
                            margin: "0 0 10px",
                            letterSpacing: "-0.01em",
                        }}>
                            {role.label}
                        </h2>

                        {/* Description */}
                        <p style={{
                            fontSize: "13.5px",
                            color: "rgba(148,163,184,0.75)",
                            margin: "0 0 28px",
                            lineHeight: 1.65,
                            fontWeight: 350,
                            flexGrow: 1,
                        }}>
                            {role.desc}
                        </p>

                        {/* Divider */}
                        <div style={{
                            height: "1px",
                            background: "rgba(255,255,255,0.06)",
                            marginBottom: "20px",
                        }} />

                        {/* CTA */}
                        <div className="cta-row" style={{ color: role.accent }}>
                            <span>{role.cta}</span>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>

            {/* Feature tags row */}
            <div style={{
                display: "flex", flexWrap: "wrap", justifyContent: "center",
                gap: "10px", marginTop: "40px", zIndex: 1,
                animation: "fadeUp 1s ease 0.3s both forwards",
            }}>
                {["GPS Tracking", "AI Predictions", "Live Alerts", "Route Management", "Fleet Analytics"].map((f) => (
                    <span key={f} style={{
                        padding: "5px 14px",
                        borderRadius: "100px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.55)",
                        fontWeight: 400,
                        letterSpacing: "0.02em",
                    }}>
                        {f}
                    </span>
                ))}
            </div>

            {/* Footer */}
            <p style={{
                color: "rgba(255,255,255,0.15)",
                fontSize: "12px",
                marginTop: "48px",
                zIndex: 1,
                letterSpacing: "0.04em",
                fontWeight: 300,
            }}>
                NextStop © 2026 — AI-Powered Bus Tracking System
            </p>
        </div>
    );
}
