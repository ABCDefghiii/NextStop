import React, { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    Polyline,
} from "react-leaflet";
import L from "leaflet";
import busIconImage from "../assets/bus.png";

const busIcon = new L.Icon({
    iconUrl: busIconImage,
    iconSize: [35, 35],
});

function RecenterMap({ lat, lng }) {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 13);
        }
    }, [lat, lng, map]);

    return null;
}

function MapView({ buses }) {
    const bus = buses[0];
    if (!bus) return null;

    const startPoint = [13.1200, 77.7400]; // fixed start
    const endPoint = [13.1500, 77.7800];   // fixed destination

    const generateFullRoute = () => {
        const path = [];
        const steps = 30;

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;

            const lat =
                startPoint[0] +
                (endPoint[0] - startPoint[0]) * progress +
                0.003 * Math.sin(progress * Math.PI);

            const lng =
                startPoint[1] +
                (endPoint[1] - startPoint[1]) * progress;

            path.push([lat, lng]);
        }

        return path;
    };


    if (!bus) return null;

    // Generate curved path
    const generateRoutePath = () => {
        const path = [];
        const steps = 20;

        const startLat = bus.lat - 0.02;
        const startLng = bus.lng - 0.02;

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;

            const lat =
                startLat +
                (bus.lat - startLat) * progress +
                0.002 * Math.sin(progress * Math.PI);

            const lng =
                startLng +
                (bus.lng - startLng) * progress;

            path.push([lat, lng]);
        }

        return path;
    };

    const fullPath = generateRoutePath();

    // Calculate progress based on distance (assuming 5km max)
    const maxDistance = 5; // must match backend
    const progressRatio = 1 - bus.distance / maxDistance;

    const progressIndex = Math.floor(progressRatio * fullPath.length);

    const traveledPath = fullPath.slice(0, progressIndex);
    const remainingPath = fullPath.slice(progressIndex);


    return (
        <MapContainer
            center={[bus.lat, bus.lng]}
            zoom={13}
            style={{ height: "400px", width: "100%", marginBottom: "20px" }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap lat={bus.lat} lng={bus.lng} />

            {/* Traveled Path (Green) */}
            <Polyline
                positions={traveledPath}
                pathOptions={{ color: "green", weight: 5 }}
            />

            {/* Remaining Path (Blue) */}
            <Polyline
                positions={remainingPath}
                pathOptions={{ color: "blue", weight: 5 }}
            />

            <Marker position={[bus.lat, bus.lng]} icon={busIcon}>
                <Popup>
                    {bus.route} <br />
                    ETA: {bus.eta} mins
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default MapView;
