const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("./routes/kakinadaRoutes");
const chatbotData = require("./chatbot.json");

//  DB
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

    if (user) {
        return res.json({ success: true, role: user.role });
    }

    res.status(401).json({ success: false });
});

// ----------------------
//  API: GET ROUTES FROM DB
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
// AUTO INSERT DATA
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

        console.log(" Default route inserted");
    }
}

// ----------------------
// SESSION CONTEXT
// ----------------------
let sessionContext = {
    busId: null,
    stop: null,
    lastIntent: null
};

// ----------------------
// BUS DATA
// ----------------------
let buses = [
    { id: 1, route: "Yanam Route", routeKey: "route1", speed: 35, distance: 5, lat: 16.7333, lng: 82.2167, pathIndex: 0 },
    { id: 2, route: "Yanam Route", routeKey: "route1", speed: 34, distance: 5, lat: 16.75, lng: 82.23, pathIndex: 3 },
    { id: 3, route: "Yanam Route", routeKey: "route1", speed: 36, distance: 5, lat: 16.82, lng: 82.26, pathIndex: 6 },
    { id: 4, route: "Uppada Route", routeKey: "route2", speed: 40, distance: 5, lat: 17.09, lng: 82.35, pathIndex: 0 },
    { id: 5, route: "Pithapuram Route", routeKey: "route3", speed: 30, distance: 5, lat: 17.1167, lng: 82.2667, pathIndex: 0 }
];

let etaHistoryLog = {};
let manualTrafficOverride = null;

// ----------------------
// TRAFFIC
// ----------------------
function getTrafficLevel() {
    if (manualTrafficOverride) return manualTrafficOverride;

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
            Math.pow(lat2 - lat1, 2) +
            Math.pow(lng2 - lng1, 2)
        );
    }

    return distance * 111;
}

// ----------------------
// CONFIDENCE
// ----------------------
function calculateConfidence(history) {
    if (!history || history.length < 2) return 90;

    const mean = history.reduce((a, b) => a + b, 0) / history.length;

    const variance = history.reduce((sum, val) =>
        sum + Math.pow(val - mean, 2), 0
    ) / history.length;

    const stdDev = Math.sqrt(variance);

    let confidence = 100 - (stdDev * 5);

    return Math.max(50, Math.min(100, Math.round(confidence)));
}

// ----------------------
// BUS SIMULATION
// ----------------------
setInterval(() => {
    buses.forEach((bus) => {
        const routeObj = routes[bus.routeKey];
        if (!routeObj) return;

        const route = routeObj.path;
        if (!route || route.length === 0) return;

        if (bus.pathIndex >= route.length) {
            bus.pathIndex = 0;
        }

        const nextPoint = route[bus.pathIndex];
        if (!nextPoint) return;

        const moveFactor = 0.1;
        bus.lat += (nextPoint.lat - bus.lat) * moveFactor;
        bus.lng += (nextPoint.lng - bus.lng) * moveFactor;

        const dist = Math.sqrt(
            Math.pow(bus.lat - nextPoint.lat, 2) +
            Math.pow(bus.lng - nextPoint.lng, 2)
        );

        if (dist < 0.0005) {
            bus.pathIndex = (bus.pathIndex + 1) % route.length;
        }

        bus.traffic = getTrafficLevel();
        bus.distance = calculateRemainingDistance(route, bus.pathIndex);

        // ETA & history
        bus.eta = Math.round((bus.distance / bus.speed) * 60);

        if (!etaHistoryLog[bus.id]) etaHistoryLog[bus.id] = [];
        etaHistoryLog[bus.id].push(bus.eta);
        if (etaHistoryLog[bus.id].length > 100) etaHistoryLog[bus.id].shift();

        bus.confidence = calculateConfidence(etaHistoryLog[bus.id]);
    });

    io.emit("busData", buses);
    io.emit("etaHistory", etaHistoryLog);

}, 1000);

// ----------------------
// SOCKET
// ----------------------
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("busData", buses);
    socket.emit("etaHistory", etaHistoryLog);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// ----------------------
// CHATBOT
// ----------------------
app.get("/chatbot", (req, res) => {
    const message = req.query.message || "";
    const busId = req.query.busId;
    const bus = buses.find(b => b.id == busId);

    const { spawn } = require("child_process");
    const python = spawn("python", ["predict_nlp.py", message]);

    let intent = "";

    python.stdout.on("data", (data) => intent += data.toString());
    python.stderr.on("data", (err) => console.error("NLP Python Error:", err.toString()));

    python.on("close", () => {
        intent = intent.trim();
        let reply = "I didn't understand that.";

        if (intent === "greeting") reply = "Hello! I'm Navis AI. How can I help you today?";
        else if (intent === "eta") reply = `Your bus will arrive in ${bus?.eta} minutes.`;
        else if (intent === "traffic") reply = `Traffic on your route is currently ${bus?.traffic}.`;
        else if (intent === "distance") reply = `The bus is ${bus?.distance?.toFixed(1)} km away.`;
        else if (intent === "speed") reply = `The bus is moving at ${bus?.speed} km/h.`;
        else if (intent === "fastest") {
            const fastest = buses.reduce((a, b) => a.speed > b.speed ? a : b);
            reply = `Bus ${fastest.id} is the fastest currently.`;
        }
        else if (intent === "route") reply = `This bus is on ${bus?.route}.`;
        else if (intent === "count") reply = `There are ${buses.length} buses running currently.`;
        else if (intent === "delay") reply = bus?.traffic === "High"
            ? "Yes, there might be a delay due to heavy traffic."
            : "No significant delays expected.";
        else if (intent === "location") reply = `The bus is near lat ${bus?.lat.toFixed(3)}, lng ${bus?.lng.toFixed(3)}.`;

        res.json({ reply });
    });
});

// ----------------------
// START SERVER
// ----------------------
async function startServer() {
    await connectDB();
    await initDB();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();