import React, { useState, useEffect } from "react";
import MapView from "../components/MapView";
import LiveChart from "../components/LiveChart";
import SystemOverview from "../components/SystemOverview";
import socket from "../socket";

function AdminDashboard() {

    const [buses, setBuses] = useState([]);
    const [etaHistory, setEtaHistory] = useState({});
    const [alerts, setAlerts] = useState([]);

    // SOCKET
    useEffect(() => {

        socket.on("busData", (data) => setBuses(data));
        socket.on("etaHistory", (data) => setEtaHistory(data));

        socket.on("criticalAlert", (data) => {
            setAlerts(prev => [
                { ...data, id: Date.now() },
                ...prev
            ]);
        });

        return () => {
            socket.off("busData");
            socket.off("etaHistory");
            socket.off("criticalAlert");
        };

    }, []);

    // ================= CALCULATIONS =================

    const calculateHealth = (bus) => {
        let score = 100;

        if (bus.traffic === "High") score -= 25;
        else if (bus.traffic === "Medium") score -= 15;

        if (bus.eta > 15) score -= 25;
        else if (bus.eta > 10) score -= 15;

        return Math.max(score, 0);
    };

    const avgETA =
        buses.length > 0
            ? Math.round(buses.reduce((sum, b) => sum + (b.eta || 0), 0) / buses.length)
            : 0;

    const avgConfidence =
        buses.length > 0
            ? Math.round(buses.reduce((sum, b) => sum + (b.confidence || 0), 0) / buses.length)
            : 0;

    // Better traffic calculation
    const trafficCounts = { Low: 0, Medium: 0, High: 0 };
    buses.forEach(b => {
        if (trafficCounts[b.traffic] !== undefined) {
            trafficCounts[b.traffic]++;
        }
    });

    const trafficLevel =
        Object.entries(trafficCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

    // ================= UI =================

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-800">

            {/* ===== SIDEBAR ===== */}
            <div className="w-64 bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 text-white p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-8">🚌 NextStop</h2>

                <div className="space-y-3">
                    <p className="bg-white/20 px-4 py-2 rounded-lg">Dashboard</p>
                    <p className="hover:bg-white/10 px-4 py-2 rounded-lg cursor-pointer">Fleet</p>
                    <p className="hover:bg-white/10 px-4 py-2 rounded-lg cursor-pointer">Routes</p>
                    <p className="hover:bg-white/10 px-4 py-2 rounded-lg cursor-pointer">Analytics</p>
                </div>
            </div>

            {/* ===== MAIN ===== */}
            <div className="flex-1 p-6 overflow-y-auto">

                <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                    Admin Dashboard
                </h1>

                {/* ===== KPI CARDS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-6">
                        <p>🚍 Fleet</p>
                        <h2 className="text-3xl font-bold">{buses.length}</h2>
                    </div>

                    <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl shadow-xl p-6">
                        <p>⏱ Avg ETA</p>
                        <h2 className="text-3xl font-bold">{avgETA} mins</h2>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-xl p-6">
                        <p>🚦 Traffic</p>
                        <h2 className="text-3xl font-bold">{trafficLevel}</h2>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-xl p-6">
                        <p>🤖 Avg Confidence</p>
                        <h2 className="text-3xl font-bold">{avgConfidence}%</h2>
                    </div>

                </div>

                {/* ===== MAP ===== */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                        🗺 Fleet Tracking
                    </h3>
                    <MapView buses={buses} isAdmin={true} />
                </div>

                {/* ===== SYSTEM OVERVIEW ===== */}
                <SystemOverview
                    buses={buses}
                    calculateHealth={calculateHealth}
                    totalBuses={buses.length}
                    avgETA={avgETA}
                    activeAlerts={alerts.length}
                    trafficLevel={trafficLevel}
                />

                {/* ===== ALERTS ===== */}
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-2">🚨 Incident Feed</h3>

                    {alerts.length === 0 ? (
                        <p className="text-green-600">✅ No active alerts</p>
                    ) : (
                        alerts.map((a, i) => (
                            <p key={i}>
                                {a.route} delay at {a.timestamp}
                            </p>
                        ))
                    )}
                </div>

                {/* ===== CHART ===== */}
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                        📈 ETA Analytics
                    </h3>
                    <LiveChart history={etaHistory} />
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;