import React from "react";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
);

function LiveChart({ history }) {

    // 🧠 Ensure it's usable
    if (!history) return null;

    const entries = Object.entries(history);

    // 🧠 If no data yet → show empty message instead of hiding
    if (entries.length === 0) {
        return (
            <div style={{ padding: "20px" }}>
                <h3>📈 Historical ETA Trend</h3>
                <p>No data yet...</p>
            </div>
        );
    }

    // 📊 Find longest dataset
    const maxLength = Math.max(
        ...entries.map(([_, arr]) => arr.length || 0)
    );

    const labels = Array.from({ length: maxLength }, (_, i) => i + 1);

    // 🎨 Build datasets
    const datasets = entries.map(([busId, values], index) => ({
        label: `Bus ${busId}`,
        data: values || [],
        borderColor: `hsl(${index * 70}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 70}, 70%, 50%, 0.2)`,
        tension: 0.3,
        fill: false,
        pointRadius: 2
    }));

    const data = {
        labels,
        datasets
    };

    const options = {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top"
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div
            style={{
                marginTop: "30px",
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                height: "300px"
            }}
        >
            <h3>📈 Historical ETA Trend (All Buses)</h3>
            <Line data={data} options={options} />
        </div>
    );
}

export default LiveChart;