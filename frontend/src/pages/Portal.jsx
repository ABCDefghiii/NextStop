import { useNavigate } from "react-router-dom";

export default function Portal() {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">

            <h1 className="text-4xl mb-8 font-bold">
                🚍 NextStop Portal
            </h1>

            <div className="flex gap-6">

                <button
                    onClick={() => navigate("/login?role=student")}
                    className="px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600"
                >
                    Student Login
                </button>

                <button
                    onClick={() => navigate("/login?role=admin")}
                    className="px-6 py-3 bg-green-500 rounded-xl hover:bg-green-600"
                >
                    Admin Login
                </button>

            </div>

        </div>
    );
}