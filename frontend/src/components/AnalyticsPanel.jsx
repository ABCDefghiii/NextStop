import React from "react";

function AnalyticsPanel({ bus, history }) {
    if (!bus) return null;

    // ---------- Trend Detection (Moving Average) ----------
    const getTrend = () => {
        if (!history || history.length < 10) return "Insufficient Data";

        const lastFive = history.slice(-5);
        const prevFive = history.slice(-10, -5);

        const avg = (arr) =>
            arr.reduce((a, b) => a + b, 0) / arr.length;

        const lastAvg = avg(lastFive);
        const prevAvg = avg(prevFive);

        const diff = lastAvg - prevAvg;

        if (diff > 1) return "Increasing Delay 📈";
        if (diff < -1) return "Improving 🚀";
        return "Stable ➖";
    };

    // ---------- ETA Forecast ----------
    const forecastETA = () => {
        if (!history || history.length < 10) return null;

        const lastFive = history.slice(-5);
        const prevFive = history.slice(-10, -5);

        const avg = (arr) =>
            arr.reduce((a, b) => a + b, 0) / arr.length;

        const lastAvg = avg(lastFive);
        const prevAvg = avg(prevFive);

        const diff = lastAvg - prevAvg;

        const projected = Math.round(bus.eta + diff);

        return {
            value: projected > 0 ? projected : 0,
            direction:
                diff > 0
                    ? "Increasing 📈"
                    : diff < 0
                        ? "Decreasing 📉"
                        : "Stable ➖"
        };
    };

    // ---------- Volatility ----------
    const calculateVolatility = () => {
        if (!history || history.length < 5) return 0;

        let diffs = [];
        for (let i = 1; i < history.length; i++) {
            diffs.push(Math.abs(history[i] - history[i - 1]));
        }

        return (
            diffs.reduce((a, b) => a + b, 0) / diffs.length
        );
    };





    // ---------- Anomaly Detection ----------
    const detectAnomaly = () => {
        if (!history || history.length < 10) return false;

        const mean =
            history.reduce((a, b) => a + b, 0) / history.length;

        const variance =
            history.reduce(
                (sum, val) => sum + Math.pow(val - mean, 2),
                0
            ) / history.length;

        const stdDev = Math.sqrt(variance);

        return bus.eta > mean + 2 * stdDev;
    };

    // ---------- Route Health Score ----------
    const calculateHealthScore = () => {
        let score = 100;

        // Traffic impact
        if (bus.traffic === "High") score -= 25;
        else if (bus.traffic === "Medium") score -= 15;

        // ETA impact
        if (bus.eta > 15) score -= 25;
        else if (bus.eta > 10) score -= 15;

        // Volatility impact
        const volatility = calculateVolatility();
        if (volatility > 2) score -= 15;

        // Anomaly impact
        if (detectAnomaly()) score -= 20;

        return Math.max(score, 0);
    };

    // ---------- Critical Risk Detection ----------
    const isCritical = () => {
        return calculateHealthScore() < 40;
    };

    return (
        <>
            <h3 style={{ marginTop: "30px" }}>📊 Route Analytics</h3>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <h4>🚀 Speed</h4>
                    <p>{bus.speed} km/h</p>
                </div>

                <div className="analytics-card">
                    <h4>📍 Distance Left</h4>
                    <p>{bus.distance} km</p>
                </div>

                <div className="analytics-card">
                    <h4>⏱ ETA</h4>
                    <p>{bus.eta} mins</p>
                </div>

                <div className="analytics-card">
                    <h4>🚦 Traffic</h4>
                    <p>{bus.traffic}</p>
                </div>

                <div className="analytics-card">
                    <h4>📈 Trend</h4>
                    <p>{getTrend()}</p>
                </div>

                <div className="analytics-card">
                    <h4>📊 Volatility</h4>
                    <p>{calculateVolatility().toFixed(2)}</p>
                </div>


                {/* Forecast Section */}
                {forecastETA() && (
                    <div className="forecast-card">
                        <h4>🔮 ETA Forecast</h4>
                        <p>Next Estimate: {forecastETA().value} mins</p>
                        <p>Trend: {forecastETA().direction}</p>
                    </div>
                )}


                {(bus.eta > 15 || detectAnomaly()) && (
                    <div className="analytics-card alert-card">
                        {bus.eta > 15 && <p>⚠️ Significant delay detected!</p>}
                        {detectAnomaly() && <p>🚨 Unusual delay pattern detected!</p>}
                    </div>
                )}
            </div>
            {/* Route Health Score */}
            <div className="health-card">
                <h4>🩺 Route Health Score</h4>
                <p className={`health-score ${calculateHealthScore() > 70
                    ? "good"
                    : calculateHealthScore() > 40
                        ? "moderate"
                        : "critical"
                    }`}>
                    {calculateHealthScore()} / 100
                </p>
            </div>

            {isCritical() && (
                <div className="critical-alert">
                    🚨 Critical Route Condition Detected!
                    <br />
                    Immediate attention recommended.
                </div>
            )}
        </>
    );

}

export default AnalyticsPanel;
