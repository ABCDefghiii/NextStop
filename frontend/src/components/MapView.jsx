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

/* ===== FIX LEAFLET ICON ===== */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

/* ===== BUS ICON ===== */
const busIcon = new L.Icon({
    iconUrl: busIconImage,
    iconSize: [35, 35]
});

/* ===== FIX MAP SIZE ===== */
function FixMapSize({ tabKey }) {
    const map = useMap();

    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [map, tabKey]);

    return null;
}

/* ===== RECENTER ===== */
function RecenterMap({ lat, lng }) {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 13);
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

/* ===== MAIN ===== */
function MapView({ buses = [], myStop, selectedBusId, isAdmin = false, tabKey = "default" }) {
    const defaultCenter = [16.9891, 82.2475];

    const selectedBus = isAdmin
        ? null
        : (buses.find(b => b.id === selectedBusId) || buses[0]);

    const routeStops =
        selectedBus &&
            selectedBus.routeKey &&
            routes[selectedBus.routeKey]
            ? routes[selectedBus.routeKey]
            : [];

    let fullPath = [];

    if (routeStops.length > 1) {
        for (let i = 0; i < routeStops.length - 1; i++) {
            const start = [routeStops[i].lat, routeStops[i].lng];
            const end = [routeStops[i + 1].lat, routeStops[i + 1].lng];

            const segment = generateCurvedPath(start, end);
            fullPath = [...fullPath, ...segment];
        }
    }

    const maxDistance = 5;

    const progressRatio = selectedBus
        ? Math.max(0, Math.min(1, 1 - (selectedBus.distance || 0) / maxDistance))
        : 0;

    const progressIndex = Math.floor(progressRatio * fullPath.length);

    const traveledPath = fullPath.slice(0, progressIndex + 1);
    const remainingPath = fullPath.slice(progressIndex);

    return (
        <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow relative z-0">
            <MapContainer
                center={
                    selectedBus
                        ? [selectedBus.lat, selectedBus.lng]
                        : defaultCenter
                }
                zoom={13}
                scrollWheelZoom={!isAdmin}
                className="w-full h-full"
            >

                <FixMapSize tabKey={tabKey} />
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
                    <Polyline
                        positions={traveledPath}
                        pathOptions={{ color: "green", weight: 5 }}
                    />
                )}

                {remainingPath.length > 0 && (
                    <Polyline
                        positions={remainingPath}
                        pathOptions={{ color: "blue", weight: 5 }}
                    />
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

                    return (
                        <Marker
                            key={bus.id}
                            position={[bus.lat, bus.lng]}
                            icon={busIcon}
                            opacity={isAdmin ? 1 : (isSelected ? 1 : 0.4)}
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
        </div>
    );
}

export default MapView;