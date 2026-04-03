const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("./routes/kakinadaRoutes");
const chatbotData = require("./chatbot.json");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json()); // ✅ FIX

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
    { id: 4, route: "Uppada Route", routeKey: "route2", speed: 40, distance: 5, lat: 16.98, lng: 82.35, pathIndex: 0 },
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
// ML PREDICTION
// ----------------------
function predictETAs(callback) {

    const python = spawn("python", ["predict_eta.py"]);

    python.stdin.write(JSON.stringify(buses));
    python.stdin.end();

    let result = "";

    python.stdout.on("data", (data) => {
        result += data.toString();
    });

    python.stderr.on("data", (err) => {
        console.error("Python error:", err.toString());
    });

    python.on("close", () => {
        try {
            const predictions = JSON.parse(result);

            buses.forEach((bus, i) => {
                bus.eta = predictions[i] || 5;
            });

        } catch (error) {
            console.error("ML fallback:", error);

            buses.forEach((bus) => {
                bus.eta = Math.round((bus.distance / bus.speed) * 60);
            });
        }

        callback();
    });
}

// ----------------------
// SIMULATION
// ----------------------
setInterval(() => {

    buses.forEach((bus) => {
        const route = routes[bus.routeKey];
        if (!route) return;

        const nextPoint = route[bus.pathIndex];
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
    });

    predictETAs(() => {

        buses.forEach((bus) => {

            if (!etaHistoryLog[bus.id]) {
                etaHistoryLog[bus.id] = [];
            }

            etaHistoryLog[bus.id].push(bus.eta);

            if (etaHistoryLog[bus.id].length > 100) {
                etaHistoryLog[bus.id].shift();
            }

            // ✅ NOW correct timing
            bus.confidence = calculateConfidence(etaHistoryLog[bus.id]);
        });

        io.emit("busData", buses);
        io.emit("etaHistory", etaHistoryLog);
    });

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

// --------------------------
// NLP Chatbot Logic
// --------------------------
app.get("/chatbot", (req, res) => {

    const message = req.query.message || "";
    const busId = req.query.busId;

    const bus = buses.find(b => b.id == busId);

    const python = spawn("python", [
        "predict_nlp.py",
        message
    ]);

    let intent = "";

    python.stdout.on("data", (data) => {
        intent += data.toString();
    });

    python.stderr.on("data", (err) => {
        console.error("NLP Python Error:", err.toString());
    });

    python.on("close", () => {

        intent = intent.trim();

        let reply = "I didn't understand that.";

        if (intent === "greeting") {
            reply = "Hello! I'm Navis AI. How can I help you today?";
        }

        else if (intent === "eta") {
            reply = `Your bus will arrive in ${bus?.eta} minutes.`;
        }

        else if (intent === "traffic") {
            reply = `Traffic on your route is currently ${bus?.traffic}.`;
        }

        else if (intent === "distance") {
            reply = `The bus is ${bus?.distance?.toFixed(1)} km away.`;
        }

        else if (intent === "speed") {
            reply = `The bus is moving at ${bus?.speed} km/h.`;
        }

        else if (intent === "fastest") {
            const fastest = buses.reduce((a, b) => a.speed > b.speed ? a : b);
            reply = `Bus ${fastest.id} is the fastest currently.`;
        }

        else if (intent === "route") {
            reply = `This bus is on ${bus?.route}.`;
        }

        else if (intent === "count") {
            reply = `There are ${buses.length} buses running currently.`;
        }

        else if (intent === "delay") {
            if (bus?.traffic === "High") {
                reply = "Yes, there might be a delay due to heavy traffic.";
            } else {
                reply = "No significant delays expected.";
            }
        }

        else if (intent === "location") {
            reply = `The bus is currently near latitude ${bus?.lat.toFixed(3)} and longitude ${bus?.lng.toFixed(3)}.`;
        }

        res.json({ reply });
    });
});


// ----------------------
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
