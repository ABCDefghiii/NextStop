import React from "react";

function SystemOverview({
    buses,
    calculateHealth,
    totalBuses,
    avgETA,
    activeAlerts,
    trafficLevel
}) {
    return (<div className="overview">

        ```
        {/* Transport Dashboard */}
        <div
            style={{
                display: "flex",
                gap: "20px",
                marginBottom: "20px",
                flexWrap: "wrap"
            }}
        >
            <div className="dashboard-card">
                🚍 Total Buses <br />
                <b>{totalBuses}</b>
            </div>

            <div className="dashboard-card">
                ⏱ Avg ETA <br />
                <b>{avgETA} mins</b>
            </div>

            <div className="dashboard-card">
                🚨 Active Alerts <br />
                <b>{activeAlerts}</b>
            </div>

            <div className="dashboard-card">
                🚦 Traffic Level <br />
                <b>{trafficLevel}</b>
            </div>
        </div>

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
