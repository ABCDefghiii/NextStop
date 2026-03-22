const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("./routes/kakinadaRoutes");


const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = 5000;

// ----------------------
// Dummy Bus Data
// ----------------------
let buses = [
    {
        id: 1,
        route: "Yanam Route",
        routeKey: "route1",
        speed: 35,
        distance: 5,
        lat: 16.7333,
        lng: 82.2167,
        pathIndex: 0
    },
    {
        id: 2,
        route: "Yanam Route",
        routeKey: "route1",
        speed: 34,
        distance: 5,
        lat: 16.75,
        lng: 82.23,
        pathIndex: 3
    },
    {
        id: 3,
        route: "Yanam Route",
        routeKey: "route1",
        speed: 36,
        distance: 5,
        lat: 16.82,
        lng: 82.26,
        pathIndex: 6
    },
    {
        id: 4,
        route: "Uppada Route",
        routeKey: "route2",
        speed: 40,
        distance: 5,
        lat: 16.98,
        lng: 82.35,
        pathIndex: 0
    },
    {
        id: 5,
        route: "Pithapuram Route",
        routeKey: "route3",
        speed: 30,
        distance: 5,
        lat: 17.1167,
        lng: 82.2667,
        pathIndex: 0
    }
];

let manualTrafficOverride = null;
let etaHistoryLog = {};

// ----------------------
// Traffic Logic
// ----------------------
function getTrafficLevel() {
    if (manualTrafficOverride) return manualTrafficOverride;

    const hour = new Date().getHours();

    if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
        return "High";
    } else if (hour > 10 && hour < 17) {
        return "Medium";
    } else {
        return "Low";
    }
}

// ----------------------
// Remaining Route Distance
// ----------------------
function calculateRemainingDistance(route, startIndex) {
    let distance = 0;

    for (let i = startIndex; i < route.length - 1; i++) {
        const lat1 = route[i].lat;
        const lng1 = route[i].lng;

        const lat2 = route[i + 1].lat;
        const lng2 = route[i + 1].lng;

        const segment = Math.sqrt(
            Math.pow(lat2 - lat1, 2) +
            Math.pow(lng2 - lng1, 2)
        );

        distance += segment;
    }

    return distance * 111;
}
// ----------------------
// Predict ETA using Python
// ----------------------
function predictETAs(callback) {

    const python = spawn("python", [
        "predict_chatbot.py",
        JSON.stringify(buses)   // ✅ FIXED (removed undefined message)
    ]);

    let result = "";

    python.stdout.on("data", (data) => {
        result += data.toString();
    });

    python.on("close", () => {
        try {
            const predictions = JSON.parse(result);

            buses.forEach((bus, i) => {
                bus.eta = predictions[i] || 5;
            });

        } catch (err) {

            console.log("Prediction failed, using fallback ETA");

            buses.forEach((bus) => {
                bus.eta = Math.round((bus.distance / bus.speed) * 60);
            });
        }

        callback();
    });
}



// ----------------------
// Simulate Bus Movement
// ----------------------
setInterval(() => {
    console.log("Sending buses:", buses.length);

    buses.forEach((bus) => {

        const route = routes[bus.routeKey];
        if (!route) return;

        const nextPoint = route[bus.pathIndex];

        const moveFactor = 0.1;

        bus.lat += (nextPoint.lat - bus.lat) * moveFactor;
        bus.lng += (nextPoint.lng - bus.lng) * moveFactor;

        const distanceToNext = Math.sqrt(
            Math.pow(bus.lat - nextPoint.lat, 2) +
            Math.pow(bus.lng - nextPoint.lng, 2)
        );

        if (distanceToNext < 0.0005) {
            bus.pathIndex++;

            if (bus.pathIndex >= route.length) {
                bus.pathIndex = 0;
            }
        }

        bus.traffic = getTrafficLevel();
        bus.distance = calculateRemainingDistance(route, bus.pathIndex);
    });

    buses.forEach((bus) => {

        // simple ETA calculation (fallback)
        bus.eta = Math.round((bus.distance / bus.speed) * 60);

        if (!etaHistoryLog[bus.id]) {
            etaHistoryLog[bus.id] = [];
        }

        etaHistoryLog[bus.id].push(bus.eta);

        if (etaHistoryLog[bus.id].length > 100) {
            etaHistoryLog[bus.id].shift();
        }

    });

    io.emit("busData", buses);
    io.emit("etaHistory", etaHistoryLog);
}, 1000);

// ----------------------
// Alerts
// ----------------------
setInterval(() => {

    buses.forEach((bus) => {

        const score =
            100
            - (bus.traffic === "High" ? 25 : bus.traffic === "Medium" ? 15 : 0)
            - (bus.eta > 20 ? 25 : bus.eta > 15 ? 15 : 0);

        if (score < 40) {
            io.emit("criticalAlert", {
                route: bus.route,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    });

}, 7000);

// ----------------------
// WebSocket
// ----------------------
io.on("connection", (socket) => {

    console.log("Client connected:", socket.id);

    socket.emit("busData", buses);
    socket.emit("etaHistory", etaHistoryLog);

    socket.on("setTraffic", (level) => {
        manualTrafficOverride = level;
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// ----------------------
// Chatbot API
// ----------------------
app.get("/chatbot", (req, res) => {

    const message = req.query.message || "";
    const messageLower = message.toLowerCase();

    // ✅ GET CONTEXT FROM FRONTEND (FIXED)
    const busId = req.query.busId;
    const selectedStopName = req.query.stop;

    const selectedBus = buses.find(b => b.id == busId);

    const userLocation = { lat: 16.95, lng: 82.25 };

    function getDistance(lat1, lng1, lat2, lng2) {
        return Math.sqrt(
            Math.pow(lat2 - lat1, 2) +
            Math.pow(lng2 - lng1, 2)
        ) * 111;
    }

    let reply = "I'm here to help you 😊";

    // 🔥 Fastest bus
    const nextBus = buses.reduce((best, bus) => {
        if (!best || bus.eta < best.eta) return bus;
        return best;
    }, null);

    if (!nextBus) {
        return res.json({
            reply: "Currently no buses are available. Please wait a moment."
        });
    }

    // 🔥 Route detection
    const matchedBus = buses.find(bus =>
        messageLower.includes(bus.route.toLowerCase().split(" ")[0])
    );

    const allStops = Object.values(routes).flat();

    const matchedStop = allStops.find(stop =>
        stop.name && messageLower.includes(stop.name.toLowerCase())
    );

    // =========================
    // 📍 CONTEXT-AWARE NEAREST STOP
    // =========================
    if (
        messageLower.includes("nearest stop") ||
        messageLower.includes("closest stop")
    ) {

        if (selectedBus && selectedBus.routeKey) {

            const routeStops = routes[selectedBus.routeKey] || [];
            const nextStop = routeStops[selectedBus.pathIndex];

            if (nextStop && nextStop.name) {
                return res.json({
                    reply: `📍 The next stop on ${selectedBus.route} is ${nextStop.name}.`
                });
            }
        }

        // fallback
        const validStops = allStops.filter(s => s.name);

        let nearestStop = null;
        let minDistance = Infinity;

        validStops.forEach(stop => {
            const dist = getDistance(
                userLocation.lat,
                userLocation.lng,
                stop.lat,
                stop.lng
            );

            if (dist < minDistance) {
                minDistance = dist;
                nearestStop = stop;
            }
        });

        return res.json({
            reply: `📍 The nearest stop is ${nearestStop.name}, about ${minDistance.toFixed(1)} km away.`
        });
    }

    // =========================
    // 🛑 STOP LOGIC
    // =========================
    if (matchedStop) {

        const busesAtStop = buses.filter(bus => {
            const routeStops = routes[bus.routeKey] || [];
            return routeStops.some(s => s.name === matchedStop.name);
        });

        if (busesAtStop.length === 0) {
            return res.json({
                reply: `No buses are available for ${matchedStop.name}.`
            });
        }

        const bestBus = busesAtStop.reduce((best, bus) => {
            if (!best || bus.eta < best.eta) return bus;
            return best;
        }, null);

        if (messageLower.includes("traffic")) {
            return res.json({
                reply: `Traffic near ${matchedStop.name} is ${bestBus.traffic}.`
            });
        }

        if (messageLower.includes("eta") || messageLower.includes("when")) {
            return res.json({
                reply: `🚌 ${bestBus.route} will reach ${matchedStop.name} in ${bestBus.eta} minutes.`
            });
        }

        return res.json({
            reply: `At ${matchedStop.name}, ${bestBus.route} arrives in ${bestBus.eta} mins with ${bestBus.traffic} traffic.`
        });
    }

    // =========================
    // 🎯 ROUTE LOGIC
    // =========================
    if (matchedBus) {

        if (messageLower.includes("eta") || messageLower.includes("when")) {
            return res.json({
                reply: `🚌 ${matchedBus.route} will arrive in ${matchedBus.eta} minutes.`
            });
        }

        if (messageLower.includes("traffic")) {
            return res.json({
                reply: `Traffic on ${matchedBus.route} is ${matchedBus.traffic}.`
            });
        }

        if (messageLower.includes("speed")) {
            return res.json({
                reply: `${matchedBus.route} is moving at ${matchedBus.speed} km/h.`
            });
        }

        return res.json({
            reply: `Status of ${matchedBus.route}: ETA ${matchedBus.eta} mins, Traffic ${matchedBus.traffic}.`
        });
    }

    // =========================
    // 🌐 GENERAL LOGIC
    // =========================

    // HELP
    if (
        messageLower.includes("help") ||
        messageLower.includes("what can you do")
    ) {
        reply = "I can help you with ETA, traffic, routes, stops, and nearest bus info 🚍";
    }

    // FASTEST BUS
    else if (messageLower.includes("fastest")) {
        reply = `🚍 ${nextBus.route} is the fastest, arriving in ${nextBus.eta} minutes.`;
    }

    // NEXT BUS
    else if (messageLower.includes("next")) {
        reply = `🚌 Next bus is ${nextBus.route}, arriving in ${nextBus.eta} minutes.`;
    }

    // ALL ETA
    else if (messageLower.includes("all") && messageLower.includes("eta")) {
        reply = buses.map(b => `${b.route}: ${b.eta} mins`).join(" | ");
    }

    // AVAILABLE BUSES
    else if (messageLower.includes("available buses")) {
        reply = buses.map(b => b.route).join(", ");
    }

    // ETA
    else if (messageLower.includes("eta")) {
        reply = `🚌 ${nextBus.route} will arrive in ${nextBus.eta} minutes.`;
    }

    // TRAFFIC
    else if (messageLower.includes("traffic")) {
        reply = `Traffic is ${nextBus.traffic} on ${nextBus.route}.`;
    }

    // DEFAULT
    else {
        reply = "Ask me about ETA, traffic, routes, or nearest stop 😊";
    }

    // ✅ ONLY ONE RESPONSE
    res.json({ reply });
});  // ✅ CLOSE chatbot API

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});