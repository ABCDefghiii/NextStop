require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const routes = require("./routes/kakinadaRoutes");
const { spawn } = require("child_process");
const Bus = require("./models/Bus");
const ETAHistory = require("./models/ETAHistory");

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

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected! Reconnecting...");
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
    const user = users.find(u => u.username === username && u.password === password);
    if (user) return res.json({ success: true, role: user.role });
    res.status(401).json({ success: false });
});

// ----------------------
// TRAFFIC
// ----------------------
let manualTrafficOverride = null;

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
        const lat1 = route[i].lat, lng1 = route[i].lng;
        const lat2 = route[i + 1].lat, lng2 = route[i + 1].lng;
        distance += Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
    }
    return distance * 111;
}

// ----------------------
// CONFIDENCE
// ----------------------
function calculateConfidence(history) {
    if (!history || history.length < 2) return 90;
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(50, Math.min(100, Math.round(100 - stdDev * 5)));
}

// ----------------------
// ML PREDICTION
// ----------------------
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
                // FIX: access .path since kakinadaRoutes uses { path: [...] }
                const route = routes[bus.routeKey]?.path;
                if (!route) return bus;

                const nextPoint = route[bus.pathIndex];
                if (!nextPoint) return bus;

                bus.lat += (nextPoint.lat - bus.lat) * 0.1;
                bus.lng += (nextPoint.lng - bus.lng) * 0.1;

                const dist = Math.sqrt(
                    Math.pow(bus.lat - nextPoint.lat, 2) +
                    Math.pow(bus.lng - nextPoint.lng, 2)
                );
                if (dist < 0.0005) {
                    bus.pathIndex = (bus.pathIndex + 1) % route.length;
                }

                bus.traffic = getTrafficLevel();
                bus.distance = calculateRemainingDistance(route, bus.pathIndex);
                return bus;
            });

            predictETAs(busArray, async (updatedBuses) => {
                const etaHistoryLog = {};

                for (const bus of updatedBuses) {
                    const etaDoc = await ETAHistory.findOneAndUpdate(
                        { busId: bus.id },
                        { $push: { history: { $each: [bus.eta], $slice: -100 } } },
                        { upsert: true, returnDocument: "after" }
                    );
                    bus.confidence = calculateConfidence(etaDoc.history);

                    await Bus.findOneAndUpdate(
                        { id: bus.id },
                        { $set: bus },
                        { returnDocument: "after" }
                    );

                    etaHistoryLog[bus.id] = etaDoc.history;
                }

                io.emit("busData", updatedBuses);
                io.emit("etaHistory", etaHistoryLog);
            });

        } catch (err) {
            console.error("Simulation error:", err.message);
        }

    }, 1000);
}

// ----------------------
// SOCKET
// ----------------------
io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id);
    const buses = await Bus.find().lean();
    socket.emit("busData", buses);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// ----------------------
// CHATBOT
// ----------------------
app.get("/chatbot", async (req, res) => {
    const message = req.query.message || "";
    const busId = req.query.busId;

    const bus = busId ? await Bus.findOne({ id: Number(busId) }).lean() : null;

    try {
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