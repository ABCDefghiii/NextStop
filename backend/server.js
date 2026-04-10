const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// DB
const { connectDB } = require("./database");
const Route = require("./Route");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = 5000;

// ----------------------
// LOGIN
// ----------------------
const users = [
    { username: "student1", password: "1234", role: "student" },
    { username: "admin", password: "admin123", role: "admin" }
];

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (user) return res.json({ success: true, role: user.role });

    return res.status(401).json({ success: false });
});

// ----------------------
// ROUTES API
// ----------------------
app.get("/api/routes", async (req, res) => {
    try {
        const routesData = await Route.find();
        res.json(routesData);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ----------------------
// INIT DB
// ----------------------
async function initDB() {
    const count = await Route.countDocuments();

    if (count === 0) {
        await Route.create({
            route_name: "Yanam → Ideal College",
            stops: [
                { name: "Yanam", lat: 16.7333, lng: 82.2167 },
                { name: "Tallarevu", lat: 16.7800, lng: 82.2400 },
                { name: "Sarpavaram", lat: 16.9000, lng: 82.2500 },
                { name: "Kakinada", lat: 16.9891, lng: 82.2475 },
                { name: "Ideal College", lat: 17.0005, lng: 82.2700 }
            ]
        });

        console.log("Default route inserted");
    }
}

// ----------------------
// BUS DATA
// ----------------------
let buses = [
    { id: 1, busId: "A", routeId: null, speed: 35, lat: 16.7333, lng: 82.2167, pathIndex: 0 },
    { id: 2, busId: "B", routeId: null, speed: 34, lat: 16.75, lng: 82.23, pathIndex: 3 },
    { id: 3, busId: "C", routeId: null, speed: 36, lat: 16.82, lng: 82.26, pathIndex: 6 },
    { id: 4, busId: "D", routeId: null, speed: 40, lat: 17.09, lng: 82.35, pathIndex: 0 },
    { id: 5, busId: "E", routeId: null, speed: 30, lat: 17.1167, lng: 82.2667, pathIndex: 0 }
];

let etaHistoryLog = {};

// ----------------------
// TRAFFIC
// ----------------------
function getTrafficLevel() {
    const hour = new Date().getHours();

    if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) return "High";
    if (hour > 10 && hour < 17) return "Medium";
    return "Low";
}

// ----------------------
// DISTANCE
// ----------------------
function calculateRemainingDistance(route, startIndex) {
    let distance = 0;

    for (let i = startIndex; i < route.length - 1; i++) {
        const lat1 = route[i].lat;
        const lng1 = route[i].lng;
        const lat2 = route[i + 1].lat;
        const lng2 = route[i + 1].lng;

        distance += Math.sqrt(
            (lat2 - lat1) ** 2 +
            (lng2 - lng1) ** 2
        );
    }

    return Math.max(distance * 111, 0.5);
}

// ----------------------
// CONFIDENCE
// ----------------------
function calculateConfidence(history) {
    if (!history || history.length < 2) return 90;

    const mean = history.reduce((a, b) => a + b, 0) / history.length;

    const variance = history.reduce((sum, val) =>
        sum + (val - mean) ** 2, 0
    ) / history.length;

    const stdDev = Math.sqrt(variance);

    const confidence = 100 - (stdDev * 5);

    return Math.max(50, Math.min(100, Math.round(confidence)));
}

// ----------------------
// LOAD ROUTES + SIMULATION
// ----------------------
setInterval(async () => {

    const allRoutes = await Route.find();

    buses.forEach((bus) => {

        const routeObj = allRoutes.find(
            r => r._id.toString() === bus.routeId
        );

        if (!routeObj || !routeObj.stops) return;

        const route = routeObj.stops;

        // 🔥 DEBUG: show routeId in terminal
        console.log(`Bus ${bus.busId} → routeId:`, bus.routeId);

        if (bus.pathIndex >= route.length) {
            bus.pathIndex = 0;
        }

        const nextPoint = route[bus.pathIndex];

        const moveFactor = 0.05;

        bus.lat += (nextPoint.lat - bus.lat) * moveFactor;
        bus.lng += (nextPoint.lng - bus.lng) * moveFactor;

        const dist = Math.sqrt(
            (bus.lat - nextPoint.lat) ** 2 +
            (bus.lng - nextPoint.lng) ** 2
        );

        if (dist < 0.0005) {
            bus.pathIndex = (bus.pathIndex + 1) % route.length;
        }

        bus.traffic = getTrafficLevel();

        bus.distance = calculateRemainingDistance(route, bus.pathIndex);

        let adjustedSpeed = bus.speed;

        if (bus.traffic === "High") adjustedSpeed *= 0.6;
        else if (bus.traffic === "Medium") adjustedSpeed *= 0.8;

        bus.eta = Math.max(
            1,
            Math.round((bus.distance / adjustedSpeed) * 60)
        );

        if (!etaHistoryLog[bus.id]) etaHistoryLog[bus.id] = [];

        etaHistoryLog[bus.id].push(bus.eta);

        if (etaHistoryLog[bus.id].length > 100) {
            etaHistoryLog[bus.id].shift();
        }

        bus.confidence = calculateConfidence(etaHistoryLog[bus.id]);
    });

    const enrichedBuses = buses.map(bus => ({
        ...bus,
        displayName: `Bus ${bus.busId}`,
        routeId: bus.routeId // 🔥 NOW YOU CAN SEE IT IN FRONTEND TOO
    }));

    io.emit("busData", enrichedBuses);
    io.emit("etaHistory", etaHistoryLog);

}, 1000);

// ----------------------
// SOCKET
// ----------------------
io.on("connection", (socket) => {

    console.log("Client connected:", socket.id);

    const enrichedBuses = buses.map(bus => ({
        ...bus,
        displayName: `Bus ${bus.busId}`,
        routeId: bus.routeId // 🔥 visible in socket too
    }));

    socket.emit("busData", enrichedBuses);
    socket.emit("etaHistory", etaHistoryLog);
});

// ----------------------
// START SERVER
// ----------------------
async function startServer() {
    await connectDB();
    await initDB();

    const routes = await Route.find();

    // 🔥 FORCE ASSIGN routeId + PRINT IT
    buses.forEach((b, i) => {
        b.routeId = routes[0]?._id?.toString();

        console.log(`INIT Bus ${b.busId} assigned routeId = ${b.routeId}`);
    });

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();