import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CONFIG from "../config";

function DriverDashboard({ setIsLoggedIn, setRole }) {

    const [isOnTrip, setIsOnTrip] = useState(false);
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState("Ready to start");
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);
    const navigate = useNavigate();

    const driverName = sessionStorage.getItem("driverName");
    const busNumber = sessionStorage.getItem("busNumber");
    const route = sessionStorage.getItem("driverRoute");
    const username = sessionStorage.getItem("username");

    const sendLocation = async (lat, lng) => {
        try {
            await fetch(`${CONFIG.BACKEND_URL}/driver/endtrip`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    lat,
                    lng,
                    busNumber: Number(busNumber)
                })
            });
            setLastUpdated(new Date().toLocaleTimeString());
            setStatus("Streaming live location ✅");
        } catch (err) {
            setStatus("Connection error — retrying...");
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("GPS not supported on this device.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation({ lat: latitude, lng: longitude });
                sendLocation(latitude, longitude);
            },
            (err) => {
                setStatus("GPS error — make sure location is enabled");
                console.error("GPS error:", err);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleStartTrip = () => {
        setIsOnTrip(true);
        setStatus("Getting your location...");
        setError("");
        getLocation();
        intervalRef.current = setInterval(getLocation, 5000);
    };

    const handleEndTrip = async () => {
        setIsOnTrip(false);
        setStatus("Trip ended");
        clearInterval(intervalRef.current);
        try {
            await fetch("http://localhost:5000/driver/endtrip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });
        } catch (err) {
            console.error("End trip error:", err);
        }
    };

    const handleLogout = async () => {
        if (isOnTrip) await handleEndTrip();
        sessionStorage.clear();
        setIsLoggedIn(false);
        setRole(null);
        navigate("/");
    };

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    const statusColor = () => {
        if (status.includes("✅")) return "text-green-400";
        if (status.includes("error") || status.includes("Error")) return "text-red-400";
        return "text-yellow-400";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-900 flex flex-col items-center justify-start px-4 py-8">

            <div className="w-full max-w-sm mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">🚌 NextStop</h1>
                    <button
                        onClick={handleLogout}
                        className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-blue-500/30 rounded-full flex items-center justify-center text-2xl">
                        🧑‍✈️
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{driverName}</h2>
                        <p className="text-white/50 text-sm">Driver</p>
                    </div>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/50">Assigned Bus</span>
                        <span className="text-white font-medium">Bus {busNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/50">Route</span>
                        <span className="text-white font-medium">{route}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/50">Status</span>
                        <span className={`font-medium ${isOnTrip ? "text-green-400" : "text-gray-400"}`}>
                            {isOnTrip ? "🟢 On Trip" : "⚫ Offline"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6">
                <h3 className="text-white/70 text-sm mb-3">📡 GPS Status</h3>
                <p className={`text-sm font-medium mb-2 ${statusColor()}`}>{status}</p>
                {location && (
                    <div className="space-y-1 text-xs text-white/40">
                        <p>Lat: {location.lat.toFixed(5)}</p>
                        <p>Lng: {location.lng.toFixed(5)}</p>
                        {lastUpdated && <p>Last updated: {lastUpdated}</p>}
                    </div>
                )}
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <div className="w-full max-w-sm">
                {!isOnTrip ? (
                    <button
                        onClick={handleStartTrip}
                        className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600
                        text-white text-xl font-bold rounded-2xl
                        hover:scale-[1.02] active:scale-[0.98]
                        transition-all duration-200 shadow-xl shadow-green-500/30"
                    >
                        🚀 Start Trip
                    </button>
                ) : (
                    <button
                        onClick={handleEndTrip}
                        className="w-full py-5 bg-gradient-to-r from-red-500 to-rose-600
                        text-white text-xl font-bold rounded-2xl
                        hover:scale-[1.02] active:scale-[0.98]
                        transition-all duration-200 shadow-xl shadow-red-500/30"
                    >
                        🛑 End Trip
                    </button>
                )}
            </div>

            <p className="text-white/20 text-xs text-center mt-6 max-w-sm">
                Keep this page open during your trip. Your location updates every 5 seconds.
            </p>

        </div>
    );
}

export default DriverDashboard;
