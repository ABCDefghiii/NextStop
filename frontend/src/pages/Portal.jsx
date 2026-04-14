import { useNavigate } from "react-router-dom";

export default function Portal() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">

            {/* Background decorative circles */}
            <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

            {/* Logo + Title */}
            <div className="text-center mb-12 z-10">
                <div className="text-6xl mb-4">🚌</div>
                <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
                    NextStop
                </h1>
                <p className="text-blue-300 text-lg max-w-md mx-auto">
                    Real-time AI-powered bus tracking for students and administrators
                </p>
            </div>

            {/* Role Cards */}
            <div className="flex flex-col md:flex-row gap-6 z-10 w-full max-w-3xl">

                {/* Student Card */}
                <button
                    onClick={() => navigate("/login?role=student")}
                    className="flex-1 group bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-400/50 backdrop-blur-md rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                    <div className="text-4xl mb-4">🎓</div>
                    <h2 className="text-xl font-bold text-white mb-2">Student</h2>
                    <p className="text-blue-300 text-sm mb-6">
                        Track your bus in real-time, get live ETA predictions and chat with Navis AI
                    </p>
                    <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
                        <span>Student Login</span>
                        <span>→</span>
                    </div>
                </button>

                {/* Driver Card */}
                <button
                    onClick={() => navigate("/login?role=driver")}
                    className="flex-1 group bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/50 backdrop-blur-md rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
                >
                    <div className="text-4xl mb-4">🧑‍✈️</div>
                    <h2 className="text-xl font-bold text-white mb-2">Driver</h2>
                    <p className="text-orange-300 text-sm mb-6">
                        Start your trip and share your live location so students can track you in real-time
                    </p>
                    <div className="flex items-center gap-2 text-orange-400 text-sm font-medium group-hover:gap-3 transition-all">
                        <span>Driver Login</span>
                        <span>→</span>
                    </div>
                </button>

                {/* Admin Card */}
                <button
                    onClick={() => navigate("/login?role=admin")}
                    className="flex-1 group bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-400/50 backdrop-blur-md rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
                >
                    <div className="text-4xl mb-4">🛠️</div>
                    <h2 className="text-xl font-bold text-white mb-2">Admin</h2>
                    <p className="text-green-300 text-sm mb-6">
                        Monitor fleet performance, view analytics, manage routes and track all buses
                    </p>
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium group-hover:gap-3 transition-all">
                        <span>Admin Login</span>
                        <span>→</span>
                    </div>
                </button>

            </div>

            {/* Footer */}
            <p className="text-white/20 text-xs mt-16 z-10">
                NextStop © 2025 — AI-Powered Bus Tracking System
            </p>

        </div>
    );
}