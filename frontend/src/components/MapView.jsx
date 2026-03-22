import React, { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    Polyline,
    CircleMarker
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import busIconImage from "../assets/bus.png";
import { routes } from "../data/routes";
import { trafficZones } from "../data/trafficZones";

/* ===== FIX LEAFLET DEFAULT ICON ISSUE ===== */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

/* ===== CUSTOM BUS ICON ===== */
const busIcon = new L.Icon({
    iconUrl: busIconImage,
    iconSize: [35, 35]
});

/* ===== RECENTER MAP ===== */
function RecenterMap({ lat, lng }) {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.panTo([lat, lng]);
        }
    }, [lat, lng, map]);

    return null;
}

/* ===== CURVED PATH ===== */
function generateCurvedPath(start, end) {
    const path = [];
    const steps = 25;

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;

        const lat =
            start[0] +
            (end[0] - start[0]) * progress +
            0.002 * Math.sin(progress * Math.PI);

        const lng =
            start[1] + (end[1] - start[1]) * progress;

        path.push([lat, lng]);
    }

    return path;
}

/* ===== MAIN COMPONENT ===== */
function MapView({ buses = [], myStop, selectedBusId, isAdmin = false }) {

    const defaultCenter = [16.9891, 82.2475];

    const selectedBus = isAdmin
        ? null
        : (buses.find(b => b.id === selectedBusId) || buses[0]);

    const routeStops =
        selectedBus && selectedBus.routeKey
            ? routes[selectedBus.routeKey]
            : [];

    let fullPath = [];

    if (routeStops && routeStops.length > 1) {
        for (let i = 0; i < routeStops.length - 1; i++) {
            const start = [routeStops[i].lat, routeStops[i].lng];
            const end = [routeStops[i + 1].lat, routeStops[i + 1].lng];

            const segment = generateCurvedPath(start, end);
            fullPath = [...fullPath, ...segment];
        }
    }

    const maxDistance = 5;

    const progressRatio = selectedBus
        ? Math.max(0, Math.min(1, 1 - selectedBus.distance / maxDistance))
        : 0;

    const progressIndex = Math.floor(progressRatio * fullPath.length);

    const traveledPath = fullPath.slice(0, progressIndex + 1);
    const remainingPath = fullPath.slice(progressIndex);

    return (
        <MapContainer
            center={selectedBus ? [selectedBus.lat, selectedBus.lng] : defaultCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "400px", width: "100%", borderRadius: "12px" }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* RECENTER */}
            {selectedBus && (
                <RecenterMap lat={selectedBus.lat} lng={selectedBus.lng} />
            )}

            {/* ROUTE */}
            {traveledPath.length > 0 && (
                <Polyline positions={traveledPath} pathOptions={{ color: "green", weight: 5 }} />
            )}

            {remainingPath.length > 0 && (
                <Polyline positions={remainingPath} pathOptions={{ color: "blue", weight: 5 }} />
            )}

            {/* STOPS */}
            {Object.values(routes).flat().map((stop, index) => {
                if (!stop.name) return null;

                const isSelected = stop.name === myStop;

                return (
                    <CircleMarker
                        key={index}
                        center={[stop.lat, stop.lng]}
                        radius={isSelected ? 10 : 6}
                        pathOptions={{
                            color: isSelected ? "#f59e0b" : "#1d4ed8",
                            fillColor: isSelected ? "#fbbf24" : "#3b82f6",
                            fillOpacity: 0.9
                        }}
                    >
                        <Popup>🚏 {stop.name}</Popup>
                    </CircleMarker>
                );
            })}

            {/* TRAFFIC */}
            {trafficZones.map((zone, index) => {
                let color = "green";
                if (zone.level === "Medium") color = "orange";
                if (zone.level === "High") color = "red";

                return (
                    <CircleMarker
                        key={index}
                        center={[zone.lat, zone.lng]}
                        radius={20}
                        pathOptions={{
                            color,
                            fillColor: color,
                            fillOpacity: 0.35
                        }}
                    >
                        <Popup>
                            🚦 {zone.name}<br />
                            Traffic: {zone.level}
                        </Popup>
                    </CircleMarker>
                );
            })}

            {/* BUSES */}
            {buses.map((bus) => {

                const isSelected = bus.id === selectedBus?.id;
                const opacityValue = isAdmin ? 1 : (isSelected ? 1 : 0.4);
                const smoothFactor = 0.2;

                return (
                    <Marker
                        key={bus.id}
                        position={[
                            bus.lat + Math.sin(Date.now() / 5000) * 0.0001,
                            bus.lng + Math.cos(Date.now() / 5000) * 0.0001
                        ]}
                        icon={busIcon}
                        opacity={isAdmin ? 1 : (bus.id === selectedBusId ? 1 : 0.4)}
                    >
                        <Popup>
                            🚌 <strong>{bus.route}</strong><br />
                            ETA: {bus.eta} mins<br />
                            Traffic: {bus.traffic}
                        </Popup>
                    </Marker>
                );
            })}

        </MapContainer>
    );
}

export default MapView;