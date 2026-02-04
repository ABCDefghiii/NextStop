import React from "react";

function BusCard({ eta, handleTrack }) {
    return (
        <div className="card">
            <h2>Route 22B – City Center</h2>
            <p className={`eta ${eta === "Arriving" ? "arriving" : ""}`}>
                {eta === "Arriving"
                    ? "🚌 Bus Arriving..."
                    : `Next Bus Arrival: ${eta} mins`}
            </p>

            <button className="track-btn" onClick={handleTrack}>
                Track Bus
            </button>
        </div>
    );
}

export default BusCard;
