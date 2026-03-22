import React from "react";
import MapView from "../components/MapView";
import LiveChart from "../components/LiveChart";
import SystemOverview from "../components/SystemOverview";

function AdminDashboard({ buses = [], etaHistory = {}, alerts = [] }) {

    // ===== HEALTH CALC =====
    const calculateHealth = (bus) => {
        let score = 100;

        if (bus.traffic === "High") score -= 25;
        else if (bus.traffic === "Medium") score -= 15;

        if (bus.eta > 15) score -= 25;
        else if (bus.eta > 10) score -= 15;

        return Math.max(score, 0);
    };

    // ===== SAFE VALUES =====
    const avgETA =
        buses.length > 0
            ? Math.round(
                buses.reduce((sum, bus) => sum + (bus.eta || 0), 0) / buses.length
            )
            : 0;

    const trafficLevel = buses[0]?.traffic || "Unknown";
    const trafficClass =
        trafficLevel === "High" ? "traffic-high" :
            trafficLevel === "Medium" ? "traffic-medium" :
                "traffic-low";

    return (
        <div className="admin-layout">

            {/* ===== SIDEBAR ===== */}
            <div className="sidebar">
                <h2>🚌 NextStop</h2>

                <div className="menu">
                    <p className="active">Dashboard</p>
                    <p>Fleet</p>
                    <p>Routes</p>
                    <p>Analytics</p>
                </div>
            </div>

            {/* ===== MAIN ===== */}
            <div className="main">

                <h1 className="admin-title">Admin Dashboard</h1>

                {/* ===== KPI CARDS ===== */}
                <div className="status-row">

                    <div className="card kpi">
                        <h4>Fleet</h4>
                        <p>{buses.length}</p>
                    </div>

                    <div className="card kpi">
                        <h4>Avg ETA</h4>
                        <p>{avgETA}</p>
                    </div>

                    <div className="card kpi">
                        <h4>Traffic</h4>
                        <p className={trafficClass}>{trafficLevel}</p>
                    </div>

                    <div className="card kpi">
                        <h4>Alerts</h4>
                        <p>{alerts.length}</p>
                    </div>

                </div>
                {/* ===== MAP ===== */}
                <div className="card admin-map">
                    <h3>🗺 Fleet Tracking</h3>

                    <MapView
                        buses={buses}
                        isAdmin={true}
                    />
                </div>

                {/* ===== SYSTEM OVERVIEW (OPTIONAL BUT POWERFUL) ===== */}
                <SystemOverview
                    buses={buses}
                    calculateHealth={calculateHealth}
                />

                {/* ===== ALERT PANEL ===== */}
                <div className="card alerts">
                    <h3>🚨 Incident Feed</h3>

                    {alerts.length === 0 ? (
                        <p>No alerts 🚦</p>
                    ) : (
                        alerts.map((a, i) => (
                            <p key={i}>
                                {a.route} delay at {a.timestamp}
                            </p>
                        ))
                    )}
                </div>

                {/* ===== CHART ===== */}
                <div className="card">
                    <h3>📈 ETA Analytics</h3>
                    <LiveChart history={Object.values(etaHistory)[0] || []} />
                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;