import React, { useState, useEffect } from "react";
import MapView from "../components/MapView";
import socket from "../socket";

function StudentDashboard() {

    // ================= STATE =================
    const [buses, setBuses] = useState([]);
    const [myStop, setMyStop] = useState("");
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState(null);
    const [liveETA, setLiveETA] = useState(0);
    const [showChat, setShowChat] = useState(false);

    // ================= SOCKET =================
    useEffect(() => {
        socket.on("busData", (data) => {
            console.log("Student received:", data);
            setBuses(data);
        });

        return () => socket.off("busData");
    }, []);

    // ================= AUTO SELECT =================
    useEffect(() => {
        if (buses.length > 0 && selectedBusId === null) {
            setSelectedBusId(buses[0].id);
        }
    }, [buses, selectedBusId]);

    // ================= DERIVED =================
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

    // ================= ETA ANIMATION =================
    useEffect(() => {
        if (!nextBus) return;

        setLiveETA(nextBus.eta);

        const interval = setInterval(() => {
            setLiveETA(prev => (prev > 0 ? prev - 1 : 0));
        }, 60000);

        return () => clearInterval(interval);
    }, [nextBus]);

    // ================= CHATBOT =================
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

    // ================= UI =================
    return (
        <div className="app">

            <h1 className="title">🚌 NextStop</h1>

            {/* ===== HEALTH STRIP ===== */}
            <div className="health-bar">
                <div>🟢 All Routes: Normal</div>
                <div>🟠 Alert: Minor Delay</div>
            </div>

            {/* ===== TRIP PLANNER ===== */}
            <div className="card trip-planner">

                <div>
                    <label>Route</label>
                    <select
                        value={selectedBusId || ""}
                        onChange={(e) => setSelectedBusId(Number(e.target.value))}
                    >
                        {buses.map((bus) => (
                            <option key={bus.id} value={bus.id}>
                                {bus.route}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Stop</label>
                    <select
                        value={myStop}
                        onChange={(e) => setMyStop(e.target.value)}
                    >
                        <option value="">Choose Stop</option>
                        <option value="Yanam">Yanam</option>
                        <option value="Tallarevu">Tallarevu</option>
                        <option value="Sarpavaram">Sarpavaram</option>
                        <option value="Kakinada">Kakinada</option>
                        <option value="Ideal College">Ideal College</option>
                    </select>
                </div>

                <div className="fleet-box">
                    <p>Active Fleet</p>
                    <h3>{buses.length}</h3>
                </div>

            </div>

            {/* ===== MAP ===== */}
            <div className="card map-card">

                {buses.length === 0 ? (
                    <div className="loading">Loading buses...</div>
                ) : (
                    <>
                        <MapView
                            buses={buses}
                            myStop={myStop}
                            selectedBusId={selectedBusId}
                        />

                        {nextBus && (
                            <div className="eta-overlay">
                                ETA: {liveETA} mins
                            </div>
                        )}
                    </>
                )}

            </div>
            {/* ===== INSIGHTS GRID ===== */}

            <div className="insights-grid">

                <div className="card">
                    <h3>⏱ ETA & Trips</h3>
                    <p>Next: {nextBus?.eta} min</p>
                    <p>Following: {nextBus?.eta + 5} min</p>
                </div>

                <div className="card">
                    <h3>📊 Route Status</h3>

                    <p>Speed: {selectedBus?.speed} km/h</p>
                    <p>Distance: {selectedBus?.distance?.toFixed(1)} km</p>

                    <p className={
                        selectedBus?.traffic === "High" ? "traffic-high" :
                            selectedBus?.traffic === "Medium" ? "traffic-medium" :
                                "traffic-low"
                    }>
                        Traffic: {selectedBus?.traffic}
                    </p>
                </div>

                <div className="card">
                    <h3>⚠ Service Alerts</h3>
                    <p>No major issues</p>
                </div>

            </div>

            {/* ===== CHAT FLOAT ===== */}
            <div
                className="chatbot-float"
                onClick={() => setShowChat(!showChat)}
            >
                💬
            </div>

            {showChat && (
                <div className="chatbot-box">

                    <div className="chat-header">
                        🤖 Navis AI
                        <span onClick={() => setShowChat(false)}>❌</span>
                    </div>

                    <div className="chat-window">
                        {chatHistory.map((msg, i) => (
                            <div
                                key={i}
                                className={
                                    msg.sender === "user"
                                        ? "chat-bubble user"
                                        : "chat-bubble ai"
                                }
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="chat-input">
                        <input
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            placeholder="Ask Navis AI..."
                        />
                        <button onClick={handleAsk}>Send</button>
                    </div>

                </div>
            )}

        </div>
    );
}

export default StudentDashboard;