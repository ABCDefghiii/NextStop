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
    if (!history || history.length === 0) {
        return null;
    }

    const data = {
        labels: history.map((_, index) => index + 1),
        datasets: [
            {
                label: "ETA Trend (mins)",
                data: history,
                borderColor: "#1e88e5",
                backgroundColor: "rgba(30,136,229,0.2)",
                tension: 0.3,
                fill: true,
                pointRadius: 2
            }
        ]
    };

    const options = {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
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
            <h3>📈 Historical ETA Trend</h3>
            <Line key={history.length} data={data} options={options} />
        </div>
    );
}

export default LiveChart;
