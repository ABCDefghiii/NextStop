require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
<<<<<<< HEAD
const mongoose = require("mongoose");
const routes = require("./routes/kakinadaRoutes");
const { spawn } = require("child_process");
const Bus = require("./models/Bus");
const ETAHistory = require("./models/ETAHistory");
=======

// DB
const { connectDB } = require("./database");
const Route = require("./Route");
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f

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

const PORT = process.env.PORT || 5000;

// ----------------------
// CONNECT MONGODB
// ----------------------
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
})
    .then(() => {
        console.log("MongoDB connected");
        seedBuses();
    })
    .catch((err) => console.error("MongoDB error:", err));

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected! Reconnecting...');
    mongoose.connect(process.env.MONGO_URI);
});

// ----------------------
// SEED BUS DATA
// ----------------------
async function seedBuses() {
    const count = await Bus.countDocuments();
    if (count === 0) {
        await Bus.insertMany([
            { id: 1, route: "Yanam Route", routeKey: "route1", speed: 35, distance: 5, lat: 16.7333, lng: 82.2167, pathIndex: 0 },
            { id: 2, route: "Yanam Route", routeKey: "route1", speed: 34, distance: 5, lat: 16.75, lng: 82.23, pathIndex: 3 },
            { id: 3, route: "Yanam Route", routeKey: "route1", speed: 36, distance: 5, lat: 16.82, lng: 82.26, pathIndex: 6 },
            { id: 4, route: "Uppada Route", routeKey: "route2", speed: 40, distance: 5, lat: 16.98, lng: 82.35, pathIndex: 0 },
            { id: 5, route: "Pithapuram Route", routeKey: "route3", speed: 30, distance: 5, lat: 17.1167, lng: 82.2667, pathIndex: 0 }
        ]);
        console.log("Buses seeded");
    } else {
        console.log(`${count} buses already in DB`);
    }
    startSimulation();
}

// ----------------------
// LOGIN
// ----------------------
const users = [
    { username: "student1", password: "1234", role: "student" },
    { username: "admin", password: "admin123", role: "admin" }
];

app.post("/login", (req, res) => {
    const { username, password } = req.body;
<<<<<<< HEAD
    const user = users.find(u => u.username === username && u.password === password);
    if (user) return res.json({ success: true, role: user.role });
    res.status(401).json({ success: false });
});

// ----------------------
=======

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
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f
// TRAFFIC
// ----------------------
let manualTrafficOverride = null;

function getTrafficLevel() {
<<<<<<< HEAD
    if (manualTrafficOverride) return manualTrafficOverride;
=======
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f
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
<<<<<<< HEAD
        const lat1 = route[i].lat, lng1 = route[i].lng;
        const lat2 = route[i + 1].lat, lng2 = route[i + 1].lng;
        distance += Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
    }
    return distance * 111;
=======
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
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f
}

// ----------------------
// CONFIDENCE
// ----------------------
function calculateConfidence(history) {
    if (!history || history.length < 2) return 90;
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
<<<<<<< HEAD
    const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(50, Math.min(100, Math.round(100 - stdDev * 5)));
=======

    const variance = history.reduce((sum, val) =>
        sum + (val - mean) ** 2, 0
    ) / history.length;

    const stdDev = Math.sqrt(variance);

    const confidence = 100 - (stdDev * 5);

    return Math.max(50, Math.min(100, Math.round(confidence)));
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f
}

// ----------------------
// LOAD ROUTES + SIMULATION
// ----------------------
<<<<<<< HEAD
function predictETAs(busArray, callback) {
    const python = spawn("python", ["predict_eta.py"]);
    python.stdin.write(JSON.stringify(busArray));
    python.stdin.end();

    let result = "";
    python.stdout.on("data", (data) => { result += data.toString(); });
    python.stderr.on("data", (err) => { console.error("Python error:", err.toString()); });

    python.on("close", () => {
        try {
            const predictions = JSON.parse(result);
            busArray.forEach((bus, i) => { bus.eta = predictions[i] || 5; });
        } catch {
            busArray.forEach((bus) => {
                bus.eta = Math.round((bus.distance / bus.speed) * 60);
            });
        }
        callback(busArray);
    });
}

// ----------------------
// SIMULATION
// ----------------------
function startSimulation() {
    setInterval(async () => {
        try {
            let busArray = await Bus.find().lean();

            busArray = busArray.map(bus => {
                const route = routes[bus.routeKey];
                if (!route) return bus;

                const nextPoint = route[bus.pathIndex];
                bus.lat += (nextPoint.lat - bus.lat) * 0.1;
                bus.lng += (nextPoint.lng - bus.lng) * 0.1;
=======
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
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f

                const dist = Math.sqrt(
                    Math.pow(bus.lat - nextPoint.lat, 2) +
                    Math.pow(bus.lng - nextPoint.lng, 2)
                );
                if (dist < 0.0005) {
                    bus.pathIndex = (bus.pathIndex + 1) % route.length;
                }

<<<<<<< HEAD
                bus.traffic = getTrafficLevel();
                bus.distance = calculateRemainingDistance(route, bus.pathIndex);
                return bus;
            });
=======
        const dist = Math.sqrt(
            (bus.lat - nextPoint.lat) ** 2 +
            (bus.lng - nextPoint.lng) ** 2
        );
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f

            predictETAs(busArray, async (updatedBuses) => {
                const etaHistoryLog = {};

                for (const bus of updatedBuses) {
                    const etaDoc = await ETAHistory.findOneAndUpdate(
                        { busId: bus.id },
                        { $push: { history: { $each: [bus.eta], $slice: -100 } } },
                        { upsert: true, returnDocument: 'after' }
                    );
                    bus.confidence = calculateConfidence(etaDoc.history);

                    await Bus.findOneAndUpdate(
                        { id: bus.id },
                        { $set: bus },
                        { returnDocument: 'after' }
                    );

                    etaHistoryLog[bus.id] = etaDoc.history;
                }

                io.emit("busData", updatedBuses);
                io.emit("etaHistory", etaHistoryLog);
            });

        } catch (err) {
            console.error("Simulation error:", err.message);
        }

<<<<<<< HEAD
    }, 1000);
}
=======
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
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f

// ----------------------
// SOCKET
// ----------------------
<<<<<<< HEAD
io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id);
    const buses = await Bus.find().lean();
    socket.emit("busData", buses);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// ----------------------
// CHATBOT — now uses persistent Flask NLP server (no spawn)
// ----------------------
app.get("/chatbot", async (req, res) => {
    const message = req.query.message || "";
    const busId = req.query.busId;

    const bus = busId ? await Bus.findOne({ id: Number(busId) }).lean() : null;

    try {
        // Call Flask NLP server instead of spawning Python
        const nlpRes = await fetch(`http://localhost:5001/predict?message=${encodeURIComponent(message)}`);
        const { intent } = await nlpRes.json();

        let reply = "I didn't understand that.";

        if (intent === "greeting") reply = "Hello! I'm Navis AI. How can I help you today?";
        else if (intent === "eta") reply = bus ? `Your bus will arrive in ${bus.eta} minutes.` : "Please select a bus first.";
        else if (intent === "traffic") reply = bus ? `Traffic is currently ${bus.traffic}.` : "Please select a bus first.";
        else if (intent === "distance") reply = bus ? `The bus is ${bus.distance?.toFixed(1)} km away.` : "Please select a bus first.";
        else if (intent === "speed") reply = bus ? `The bus is moving at ${bus.speed} km/h.` : "Please select a bus first.";
        else if (intent === "route") reply = bus ? `This bus is on ${bus.route}.` : "Please select a bus first.";
        else if (intent === "location") reply = bus ? `Bus is near lat ${bus.lat?.toFixed(3)}, lng ${bus.lng?.toFixed(3)}.` : "Please select a bus first.";
        else if (intent === "count") {
            const total = await Bus.countDocuments();
            reply = `There are ${total} buses running currently.`;
        }
        else if (intent === "delay") reply = bus?.traffic === "High" ? "Yes, delays expected due to heavy traffic." : "No significant delays expected.";
        else if (intent === "fastest") {
            const allBuses = await Bus.find().lean();
            const fastest = allBuses.reduce((a, b) => a.speed > b.speed ? a : b);
            reply = `Bus ${fastest.id} is the fastest currently.`;
        }

        res.json({ reply });

    } catch (err) {
        console.error("NLP Flask error:", err.message);
        res.json({ reply: "Sorry, the AI service is unavailable right now." });
    }
});

// ----------------------
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
=======
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
>>>>>>> 03c2b550abc1bdc4c882e2154344801524a69e8f
