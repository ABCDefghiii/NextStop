import React, { useState, useEffect } from "react";
import MapView from "../components/MapView";
import socket from "../socket";

function StudentDashboard() {

    const [buses, setBuses] = useState([]);
    const [myStop, setMyStop] = useState("");
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState(null);
    const [liveETA, setLiveETA] = useState(0);
    const [showChat, setShowChat] = useState(false);

    // SOCKET
    useEffect(() => {
        socket.on("busData", (data) => setBuses(data));
        return () => socket.off("busData");
    }, []);

    // AUTO SELECT
    useEffect(() => {
        if (buses.length > 0 && selectedBusId === null) {
            setSelectedBusId(buses[0].id);
        }
    }, [buses, selectedBusId]);

    const selectedBus =
        buses.find(bus => bus.id === selectedBusId) ||
        (buses.length > 0 ? buses[0] : null);

    const nextBus =
        buses.length > 0
            ? buses.reduce((best, bus) => {
                if (!best || bus.eta < best.eta) return bus;
                return best;
            }, null)
            : null;

    // ETA animation
    useEffect(() => {
        if (!nextBus) return;

        setLiveETA(nextBus.eta);

        const interval = setInterval(() => {
            setLiveETA(prev => (prev > 0 ? prev - 1 : 0));
        }, 60000);

        return () => clearInterval(interval);
    }, [nextBus]);

    // CHATBOT
    const handleAsk = async () => {
        if (!userMessage.trim()) return;

        try {
            const response = await fetch(
                `http://localhost:5000/chatbot?message=${userMessage}&busId=${selectedBusId}&stop=${myStop}`
            );

            const data = await response.json();

            setChatHistory(prev => [
                ...prev,
                { sender: "user", text: userMessage },
                { sender: "ai", text: data.reply }
            ]);

            setUserMessage("");

        } catch (error) {
            console.error("Chatbot error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">

            {/* ===== HEADER ===== */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-md rounded-2xl p-4 mb-6 flex justify-between items-center">

                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    🚌 NextStop
                </h1>

                <div className="flex gap-3 items-center">

                    <select
                        value={selectedBusId || ""}
                        onChange={(e) => setSelectedBusId(Number(e.target.value))}
                        className="px-3 py-2 rounded-lg border"
                    >
                        {buses.map((bus) => (
                            <option key={bus.id} value={bus.id}>
                                {bus.route}
                            </option>
                        ))}
                    </select>

                    <select
                        value={myStop}
                        onChange={(e) => setMyStop(e.target.value)}
                        className="px-3 py-2 rounded-lg border"
                    >
                        <option value="">Choose Stop</option>
                        <option value="Yanam">Yanam</option>
                        <option value="Tallarevu">Tallarevu</option>
                        <option value="Sarpavaram">Sarpavaram</option>
                        <option value="Kakinada">Kakinada</option>
                        <option value="Ideal College">Ideal College</option>
                    </select>

                    <button
                        onClick={() => {
                            localStorage.removeItem("isLoggedIn");
                            window.location.href = "/login";
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                        Logout
                    </button>

                </div>
            </div>

            {/* ===== MAP ===== */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-3 mb-6 relative">

                <MapView buses={buses} myStop={myStop} selectedBusId={selectedBusId} />

                {/* ETA BOX */}
                {nextBus && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
                        ETA: {liveETA} mins <br />
                        <span className="text-xs">
                            {nextBus.confidence || 90}% confidence
                        </span>
                    </div>
                )}

                {/* FLOATING CARDS */}
                <div className="absolute top-6 left-6 space-y-3">

                    <div className="bg-white p-3 rounded shadow w-44">
                        <p className="text-xs">🚍 Speed</p>
                        <h2 className="text-green-600 font-bold">
                            {selectedBus?.speed} km/h
                        </h2>
                    </div>

                    <div className="bg-white p-3 rounded shadow w-44">
                        <p className="text-xs">📏 Distance</p>
                        <h2 className="text-blue-600 font-bold">
                            {selectedBus?.distance?.toFixed(1)} km
                        </h2>
                    </div>

                    <div className="bg-white p-3 rounded shadow w-44">
                        <p className="text-xs">🚦 Traffic</p>
                        <h2 className="font-bold">{selectedBus?.traffic}</h2>
                    </div>

                </div>
            </div>

            {/* ===== BOTTOM CARDS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="font-bold mb-2">📊 Route Status</h3>
                    <p>Speed: {selectedBus?.speed} km/h</p>
                    <p>Distance: {selectedBus?.distance?.toFixed(1)} km</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="font-bold mb-2">⏱ ETA & Trips</h3>
                    <p>Next: {liveETA} mins</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="font-bold mb-2">⚠ Service Alerts</h3>
                    <p className="text-green-600">No major issues</p>
                </div>

            </div>

            {/* ===== GLASS CHATBOT ===== */}
            <div className="fixed bottom-6 right-6 z-[2000]">

                {/* Floating Button */}
                {!showChat && (
                    <button
                        onClick={() => setShowChat(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 
            text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
                    >
                        💬
                    </button>
                )}

                {/* Chat Window */}
                {showChat && (
                    <div className="w-80 
        backdrop-blur-xl bg-white/20 dark:bg-gray-800/30 
        border border-white/30 dark:border-gray-700/40 
        rounded-2xl shadow-2xl overflow-hidden">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 
            text-white p-3 flex justify-between items-center">
                            <span className="font-semibold">🤖 Navis AI</span>
                            <button onClick={() => setShowChat(false)}>✖</button>
                        </div>

                        {/* Messages */}
                        <div className="p-3 h-64 overflow-y-auto space-y-2">

                            {chatHistory.length === 0 && (
                                <p className="text-gray-200 text-sm">
                                    Hello! How can I help you?
                                </p>
                            )}

                            {chatHistory.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.sender === "user"
                                        ? "ml-auto bg-blue-500 text-white"
                                        : "bg-white/40 text-gray-800 dark:text-white backdrop-blur-md"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex border-t border-white/20">

                            <input
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                                className="flex-1 p-2 bg-transparent outline-none text-white placeholder-gray-300"
                                placeholder="Ask Navis AI..."
                            />

                            <button
                                onClick={handleAsk}
                                className="bg-blue-600 text-white px-4"
                            >
                                Send
                            </button>

                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default StudentDashboard;