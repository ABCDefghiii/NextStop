import React from "react";

function BusCard({ route, eta, traffic }) {
    const getTrafficColor = () => {
        if (traffic === "High") return "red";
        if (traffic === "Medium") return "orange";
        return "green";
    };

    return (
        <div className="card">
            <h2>{route}</h2>

            <p className="eta">
                Next Bus Arrival: {eta} mins
            </p>

            <div className="traffic-badge" style={{ backgroundColor: getTrafficColor() }}>
                Traffic: {traffic}
            </div>
        </div>
    );
}

export default BusCard;
