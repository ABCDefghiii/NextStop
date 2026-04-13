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

// Distinct, professional colors for each bus
const BUS_COLORS = [
    { border: "#3B82F6", background: "rgba(59,130,246,0.1)" }, // blue   — Bus 1
    { border: "#10B981", background: "rgba(16,185,129,0.1)" }, // green  — Bus 2
    { border: "#F59E0B", background: "rgba(245,158,11,0.1)" }, // amber  — Bus 3
    { border: "#EF4444", background: "rgba(239,68,68,0.1)" }, // red    — Bus 4
    { border: "#8B5CF6", background: "rgba(139,92,246,0.1)" }, // purple — Bus 5
];

function LiveChart({ history }) {

    if (!history) return null;

    const entries = Object.entries(history);

    if (entries.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                No ETA history yet — data will appear shortly...
            </p>
        );
    }

    const maxLength = Math.max(...entries.map(([_, arr]) => arr.length || 0));
    const labels = Array.from({ length: maxLength }, (_, i) => `T${i + 1}`);

    const datasets = entries.map(([busId, values], index) => {
        const color = BUS_COLORS[index % BUS_COLORS.length];
        return {
            label: `Bus ${busId}`,
            data: values || [],
            borderColor: color.border,
            backgroundColor: color.background,
            borderWidth: 2.5,
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 5,
        };
    });

    const data = { labels, datasets };

    const options = {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            legend: {
                position: "top",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 20,
                    font: { size: 12 }
                }
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` Bus ${ctx.dataset.label.replace("Bus ", "")}: ${ctx.parsed.y} mins`
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Simulation Tick",
                    color: "#6B7280",
                    font: { size: 12 }
                },
                ticks: {
                    maxTicksLimit: 10,
                    color: "#9CA3AF"
                },
                grid: { color: "rgba(0,0,0,0.05)" }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "ETA (minutes)",
                    color: "#6B7280",
                    font: { size: 12 }
                },
                ticks: { color: "#9CA3AF" },
                grid: { color: "rgba(0,0,0,0.05)" }
            }
        }
    };

    return (
        <div style={{ height: "320px" }}>
            <Line data={data} options={options} />
        </div>
    );
}

export default LiveChart;