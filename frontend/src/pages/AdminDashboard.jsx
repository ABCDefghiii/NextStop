import React, { useState, useEffect } from "react";
import MapView from "../components/MapView";
import LiveChart from "../components/LiveChart";
import SystemOverview from "../components/SystemOverview";
import socket from "../socket";

const ROUTES = {
    route1: "Yanam Route",
    route2: "Uppada Route",
    route3: "Pithapuram Route",
};

function AdminDashboard({ setIsLoggedIn, setRole }) {

    const [buses, setBuses] = useState([]);
    const [etaHistory, setEtaHistory] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [mapBuses, setMapBuses] = useState([]);

    // SOCKET
    useEffect(() => {
        socket.on("busData", (data) => setBuses([...data]));
        socket.on("etaHistory", (data) => setEtaHistory(data));
        socket.on("criticalAlert", (data) => {
            setAlerts(prev => [{ ...data, id: Date.now() }, ...prev]);
        });
        return () => {
            socket.off("busData");
            socket.off("etaHistory");
            socket.off("criticalAlert");
        };
    }, []);

    // UPDATE MAP EVERY 5 SECONDS — prevents blinking
    useEffect(() => {
        if (buses.length > 0 && mapBuses.length === 0) {
            setMapBuses([...buses]);
        }
        const interval = setInterval(() => {
            setMapBuses([...buses]);
        }, 5000);
        return () => clearInterval(interval);
    }, [buses]);

    // LOGOUT
    const handleLogout = () => {
        localStorage.clear();
        if (setIsLoggedIn) setIsLoggedIn(false);
        if (setRole) setRole(null);
    };

    // CALCULATIONS
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

    const trafficCounts = { Low: 0, Medium: 0, High: 0 };
    buses.forEach(b => { if (trafficCounts[b.traffic] !== undefined) trafficCounts[b.traffic]++; });
    const trafficLevel = Object.entries(trafficCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

    const trafficColor = (t) =>
        t === "High" ? "text-red-500" : t === "Medium" ? "text-yellow-500" : "text-green-500";

    const healthColor = (h) =>
        h > 70 ? "bg-green-500" : h > 40 ? "bg-yellow-500" : "bg-red-500";

    const tabs = ["Dashboard", "Fleet", "Routes", "Analytics"];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-800">

            {/* ===== SIDEBAR ===== */}
            <div className="w-64 bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 text-white p-6 shadow-xl flex flex-col">
                <h2 className="text-xl font-bold mb-8">🚌 NextStop</h2>

                <div className="space-y-2 flex-1">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${activeTab === tab
                                    ? "bg-white/30 font-semibold"
                                    : "hover:bg-white/10"
                                }`}
                        >
                            {tab === "Dashboard" && "📊 "}
                            {tab === "Fleet" && "🚍 "}
                            {tab === "Routes" && "🛣 "}
                            {tab === "Analytics" && "📈 "}
                            {tab}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-8 bg-white/10 hover:bg-red-500/80 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-left"
                >
                    🚪 Logout
                </button>
            </div>

            {/* ===== MAIN ===== */}
            <div className="flex-1 p-6 overflow-y-auto">

                {/* KPI CARDS — always visible */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-6">
                        <p className="text-sm opacity-80">🚍 Fleet</p>
                        <h2 className="text-3xl font-bold">{buses.length}</h2>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl shadow-xl p-6">
                        <p className="text-sm opacity-80">⏱ Avg ETA</p>
                        <h2 className="text-3xl font-bold">{avgETA} mins</h2>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-xl p-6">
                        <p className="text-sm opacity-80">🚦 Traffic</p>
                        <h2 className="text-3xl font-bold">{trafficLevel}</h2>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-xl p-6">
                        <p className="text-sm opacity-80">🤖 Avg Confidence</p>
                        <h2 className="text-3xl font-bold">{avgConfidence}%</h2>
                    </div>
                </div>

                {/* ===== DASHBOARD TAB ===== */}
                {activeTab === "Dashboard" && (
                    <>
                        {/* MAP */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-4 mb-6">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">🗺 Fleet Tracking</h3>
                            <MapView buses={mapBuses} isAdmin={true} tabKey={activeTab} />
                        </div>

                        {/* SYSTEM OVERVIEW */}
                        <SystemOverview
                            buses={buses}
                            calculateHealth={calculateHealth}
                            totalBuses={buses.length}
                            avgETA={avgETA}
                            activeAlerts={alerts.length}
                            trafficLevel={trafficLevel}
                        />

                        {/* ALERTS */}
                        <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6 mt-6">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">🚨 Incident Feed</h3>
                            {alerts.length === 0 ? (
                                <p className="text-green-600 font-medium">✅ No active alerts</p>
                            ) : (
                                <div className="space-y-2">
                                    {alerts.map((a) => (
                                        <div
                                            key={a.id}
                                            className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"
                                        >
                                            <span>⚠️</span>
                                            <div>
                                                <p className="font-medium text-red-700 dark:text-red-300">{a.route} — delay reported</p>
                                                <p className="text-sm text-red-500 dark:text-red-400">{a.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CHART */}
                        <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6 mt-6">
                            <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">📈 ETA Analytics</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                ML-predicted ETA per bus across simulation ticks.
                            </p>
                            <LiveChart history={etaHistory} />
                        </div>
                    </>
                )}

                {/* ===== FLEET TAB ===== */}
                {activeTab === "Fleet" && (
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">🚍 Fleet Overview</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                                        <th className="pb-3 pr-4">Bus ID</th>
                                        <th className="pb-3 pr-4">Route</th>
                                        <th className="pb-3 pr-4">Speed</th>
                                        <th className="pb-3 pr-4">Distance</th>
                                        <th className="pb-3 pr-4">ETA</th>
                                        <th className="pb-3 pr-4">Traffic</th>
                                        <th className="pb-3 pr-4">Confidence</th>
                                        <th className="pb-3">Health</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buses.map((bus) => {
                                        const health = calculateHealth(bus);
                                        return (
                                            <tr
                                                key={bus.id}
                                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <td className="py-3 pr-4 font-medium text-gray-800 dark:text-white">Bus {bus.id}</td>
                                                <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{bus.route}</td>
                                                <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{bus.speed} km/h</td>
                                                <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{bus.distance?.toFixed(1)} km</td>
                                                <td className="py-3 pr-4 font-medium text-blue-600 dark:text-blue-400">{bus.eta} mins</td>
                                                <td className={`py-3 pr-4 font-medium ${trafficColor(bus.traffic)}`}>{bus.traffic}</td>
                                                <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{bus.confidence || 90}%</td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${healthColor(health)}`}
                                                                style={{ width: `${health}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500">{health}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ===== ROUTES TAB ===== */}
                {activeTab === "Routes" && (
                    <div className="space-y-6">
                        {Object.entries(ROUTES).map(([key, name]) => {
                            const routeBuses = buses.filter(b => b.routeKey === key);
                            const avgRouteETA = routeBuses.length > 0
                                ? Math.round(routeBuses.reduce((s, b) => s + (b.eta || 0), 0) / routeBuses.length)
                                : 0;
                            const routeTraffic = routeBuses[0]?.traffic || "Unknown";

                            return (
                                <div key={key} className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">🛣 {name}</h3>
                                        <div className="flex gap-3">
                                            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                                                {routeBuses.length} bus{routeBuses.length !== 1 ? "es" : ""}
                                            </span>
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${routeTraffic === "High"
                                                    ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300"
                                                    : routeTraffic === "Medium"
                                                        ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300"
                                                        : "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300"
                                                }`}>
                                                {routeTraffic} traffic
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Avg ETA</p>
                                            <p className="text-xl font-bold text-gray-800 dark:text-white">{avgRouteETA} mins</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Active Buses</p>
                                            <p className="text-xl font-bold text-gray-800 dark:text-white">{routeBuses.length}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {routeBuses.map(bus => (
                                            <div
                                                key={bus.id}
                                                className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/30 rounded-lg px-4 py-2"
                                            >
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Bus {bus.id}</span>
                                                <span className="text-blue-600 dark:text-blue-400">{bus.eta} mins ETA</span>
                                                <span className="text-gray-500 dark:text-gray-400">{bus.speed} km/h</span>
                                                <span className="text-gray-500 dark:text-gray-400">{bus.distance?.toFixed(1)} km</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ===== ANALYTICS TAB ===== */}
                {activeTab === "Analytics" && (
                    <div className="space-y-6">
                        <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">📈 Real-Time ETA Trend</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
                                ML-predicted ETA per bus across simulation ticks. Each tick = 1 second.
                            </p>
                            <LiveChart history={etaHistory} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {buses.map((bus) => {
                                const busHistory = etaHistory[bus.id] || [];
                                const avg = busHistory.length > 0
                                    ? Math.round(busHistory.reduce((a, b) => a + b, 0) / busHistory.length)
                                    : 0;
                                const min = busHistory.length > 0 ? Math.min(...busHistory) : 0;
                                const max = busHistory.length > 0 ? Math.max(...busHistory) : 0;

                                return (
                                    <div key={bus.id} className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-4">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Bus {bus.id}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{bus.route}</p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Avg</span>
                                                <span className="font-medium text-gray-800 dark:text-white">{avg} min</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Min</span>
                                                <span className="font-medium text-green-600">{min} min</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Max</span>
                                                <span className="font-medium text-red-500">{max} min</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default AdminDashboard;