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

            {/* ===== SYSTEM OVERVIEW ===== */}
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    📊 System Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {buses.map((bus) => {
                        const health = calculateHealth(bus);

                        return (
                            <div
                                key={bus.id}
                                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 shadow-sm"
                            >
                                {/* Bus ID + Route Name */}
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        Bus {bus.id} — {bus.route}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {health} / 100
                                    </p>
                                </div>

                                {/* Health Bar */}
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${health > 70
                                            ? "bg-green-500"
                                            : health > 40
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                            }`}
                                        style={{ width: `${health}%` }}
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>⏱ ETA: {bus.eta} mins</span>
                                    <span>🚦 {bus.traffic}</span>
                                    <span>📍 {bus.distance?.toFixed(1)} km</span>
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