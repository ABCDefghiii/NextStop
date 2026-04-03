import React from "react";

function SystemOverview({
    buses,
    calculateHealth,
    totalBuses,
    avgETA,
    activeAlerts,
    trafficLevel
}) {
    return (
        <div>

            {/* ===== TOP STATS ===== */}
            <div className="flex gap-4 mb-6 flex-wrap">

                <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
                    🚍 Total Buses <br />
                    <b>{totalBuses}</b>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
                    ⏱ Avg ETA <br />
                    <b>{avgETA} mins</b>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
                    🚨 Active Alerts <br />
                    <b>{activeAlerts}</b>
                    <p className="text-green-600 font-medium">
                        ✅ No active alerts
                    </p>                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
                    🚦 Traffic Level <br />
                    <b>{trafficLevel}</b>
                </div>

            </div>

            {/* ===== SYSTEM OVERVIEW ===== */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                    📊 System Overview</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {buses.map((bus, index) => {
                        const health = calculateHealth(bus);

                        return (
                            <div key={index} className="p-4 rounded-xl bg-gray-50 shadow-sm">

                                {/* Route Name */}
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-medium">{bus.route}</p>
                                    <p className="text-sm text-gray-500">{health} / 100</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full ${health > 70
                                            ? "bg-green-500"
                                            : health > 40
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                            }`}
                                        style={{ width: `${health}%` }}
                                    ></div>
                                </div>

                                {/* Details */}
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>⏱ ETA: {bus.eta} mins</span>
                                    <span>🚦 {bus.traffic}</span>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}

export default SystemOverview;