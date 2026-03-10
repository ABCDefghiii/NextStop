import React from "react";

function SystemOverview({ buses, calculateHealth }) {
    return (
        <div className="overview">
            <h3>📊 System Overview</h3>
            <div className="overview-grid">
                {buses.map((bus) => {
                    const score = calculateHealth(bus);

                    return (
                        <div key={bus.id} className="overview-card">
                            <p><strong>{bus.route}</strong></p>

                            <p style={{ marginBottom: "6px" }}>
                                {score} / 100
                            </p>

                            <div className="health-bar">
                                <div
                                    className={`health-fill ${score > 70
                                            ? "good"
                                            : score > 40
                                                ? "moderate"
                                                : "critical"
                                        }`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>

                            <p style={{ fontSize: "13px" }}>
                                ⏱ ETA: {bus.eta} mins
                            </p>

                            <p style={{ fontSize: "13px" }}>
                                🚦 Traffic: {bus.traffic}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SystemOverview;