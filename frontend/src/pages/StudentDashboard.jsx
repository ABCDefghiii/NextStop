import React, { useState, useEffect, useRef } from "react";
import MapView from "../components/MapView";
import socket from "../socket";
import CONFIG from "../config";

function StudentDashboard({ setIsLoggedIn, setRole }) {

    const [buses, setBuses] = useState([]);
    const [myStop, setMyStop] = useState("");
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState(null);
    const [liveETA, setLiveETA] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const chatEndRef = useRef(null);

    const studentName = sessionStorage.getItem("studentName");
    const preferredRoute = sessionStorage.getItem("preferredRoute");

    // SOCKET
    useEffect(() => {
        socket.on("busData", (data) => {
            setBuses([...data]);
        });
        return () => socket.off("busData");
    }, []);

    // AUTO SELECT preferred route bus
    useEffect(() => {
        if (buses.length > 0 && selectedBusId === null) {
            const preferred = buses.find(b => b.route === preferredRoute);
            setSelectedBusId(preferred ? preferred.id : buses[0].id);
        }
    }, [buses, selectedBusId, preferredRoute]);

    // AUTO SCROLL CHAT
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!nextBus) return;
        setLiveETA(Math.max(0, Math.round(nextBus.eta)));
    }, [nextBus?.eta]);

    // LOGOUT
    const handleLogout = () => {
        sessionStorage.clear();
        setIsLoggedIn(false);
        setRole(null);
    };

    // CHATBOT
    const handleAsk = async () => {
        if (!userMessage.trim()) return;

        const msgToSend = userMessage;
        setUserMessage("");

        setChatHistory(prev => [...prev, { sender: "user", text: msgToSend }]);

        try {

            // Replace fetch URL:
            const response = await fetch(
                `${CONFIG.BACKEND_URL}/chatbot?message=${encodeURIComponent(msgToSend)}&busId=${selectedBusId}&stop=${myStop}`
            );
            const data = await response.json();
            setChatHistory(prev => [...prev, { sender: "ai", text: data.reply }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { sender: "ai", text: "Sorry, I couldn't connect to the server." }]);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">

            {/* HEADER */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-md rounded-2xl p-4 mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">🚌 NextStop</h1>
                    {studentName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Welcome, {studentName}</p>
                    )}
                </div>
                <div className="flex gap-3 items-center">
                    <select
                        value={selectedBusId || ""}
                        onChange={(e) => setSelectedBusId(Number(e.target.value))}
                        className="px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                        {buses.map((bus) => (
                            <option key={bus.id} value={bus.id}>
                                Bus {bus.id} — {bus.route}
                            </option>
                        ))}
                    </select>
                    <select
                        value={myStop}
                        onChange={(e) => setMyStop(e.target.value)}
                        className="px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                        <option value="">Choose Stop</option>
                        <option value="Yanam">Yanam</option>
                        <option value="Tallarevu">Tallarevu</option>
                        <option value="Sarpavaram">Sarpavaram</option>
                        <option value="Kakinada">Kakinada</option>
                        <option value="Ideal College">Ideal College</option>
                    </select>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* MAP */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-3 mb-6 relative">
                <MapView buses={buses} myStop={myStop} selectedBusId={selectedBusId} />

                {/* ETA BOX */}
                {nextBus && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg text-center min-w-[120px]">
                        <p className="text-xs opacity-80 mb-1">Next Arrival</p>
                        <p className="text-2xl font-bold">{Math.max(0, Math.round(liveETA))} min</p>
                        <p className="text-xs opacity-80 mt-1">🎯 {nextBus.confidence || 90}% confidence</p>
                    </div>
                )}

                {/* FLOATING CARDS */}
                <div className="absolute top-6 left-6 space-y-3">
                    <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded shadow w-44">
                        <p className="text-xs text-gray-500 dark:text-gray-400">🚍 Speed</p>
                        <h2 className="text-green-600 dark:text-green-400 font-bold">{selectedBus?.speed} km/h</h2>
                    </div>
                    <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded shadow w-44">
                        <p className="text-xs text-gray-500 dark:text-gray-400">📏 Distance</p>
                        <h2 className="text-blue-600 dark:text-blue-400 font-bold">{selectedBus?.distance?.toFixed(1)} km</h2>
                    </div>
                    <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded shadow w-44">
                        <p className="text-xs text-gray-500 dark:text-gray-400">🚦 Traffic</p>
                        <h2 className={`font-bold ${selectedBus?.traffic === "High" ? "text-red-500"
                            : selectedBus?.traffic === "Medium" ? "text-yellow-500"
                                : "text-green-500"
                            }`}>
                            {selectedBus?.traffic}
                        </h2>
                    </div>
                </div>
            </div>

            {/* BOTTOM CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl shadow">
                    <h3 className="font-bold mb-2 text-gray-800 dark:text-white">📊 Route Status</h3>
                    <p className="text-gray-600 dark:text-gray-300">Speed: {selectedBus?.speed} km/h</p>
                    <p className="text-gray-600 dark:text-gray-300">Distance: {selectedBus?.distance?.toFixed(1)} km</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl shadow">
                    <h3 className="font-bold mb-2 text-gray-800 dark:text-white">⏱ ETA & Trips</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Bus {selectedBus?.id} ETA: <strong>{Math.max(0, Math.round(selectedBus?.eta || 0))} mins</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">Route: {selectedBus?.route}</p>
                    <p className="text-gray-600 dark:text-gray-300">Confidence: {selectedBus?.confidence || 90}%</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl shadow">
                    <h3 className="font-bold mb-2 text-gray-800 dark:text-white">⚠ Service Alerts</h3>
                    <p className={selectedBus?.traffic === "High" ? "text-red-500" : "text-green-600"}>
                        {selectedBus?.traffic === "High" ? "Heavy traffic detected" : "No major issues"}
                    </p>
                </div>
            </div>

            {/* CHATBOT */}
            <div className="fixed bottom-6 right-6 z-[2000]">
                {!showChat && (
                    <button
                        onClick={() => setShowChat(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600
                        text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
                    >
                        💬
                    </button>
                )}
                {showChat && (
                    <div className="w-80 backdrop-blur-xl bg-white/20 dark:bg-gray-800/30
                    border border-white/30 dark:border-gray-700/40
                    rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600
                        text-white p-3 flex justify-between items-center">
                            <span className="font-semibold">🤖 Navis AI</span>
                            <button onClick={() => setShowChat(false)} className="hover:opacity-70 transition-opacity">✖</button>
                        </div>
                        <div className="p-3 h-64 overflow-y-auto space-y-2">
                            {chatHistory.length === 0 && (
                                <p className="text-gray-200 text-sm">Hello! Ask me about your bus ETA, traffic, or route!</p>
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
                            <div ref={chatEndRef} />
                        </div>
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
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 transition-colors duration-200"
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
