const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { spawn } = require("child_process");

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
    { id: 1, route: "22B - City Center", speed: 35, distance: 15, lat: 13.0827, lng: 80.2707 },
    { id: 2, route: "15A - Airport", speed: 40, distance: 25, lat: 13.0674, lng: 80.2376 },
    { id: 3, route: "7C - Railway Station", speed: 30, distance: 35, lat: 13.1000, lng: 80.2500 }
];

let manualTrafficOverride = null;
let etaHistoryLog = {};

// ----------------------
// Traffic Logic (Only for traffic label)
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
// ML Prediction Function
// ----------------------
function predictETA(bus) {
    return new Promise((resolve, reject) => {
        const python = spawn("python", ["predict_eta.py"]);

        const inputData = {
            route_id: bus.id,
            distance_km: bus.distance,
            speed_kmph: bus.speed,
            traffic_level: getTrafficLevel(),
            hour_of_day: new Date().getHours(),
            day_of_week: new Date().getDay(),
            previous_eta: bus.eta || 10
        };

        python.stdin.write(JSON.stringify(inputData));
        python.stdin.end();

        python.stdout.on("data", (data) => {
            resolve(parseFloat(data.toString()));
        });

        python.stderr.on("data", (data) => {
            console.error("Python Error:", data.toString());
            reject(data.toString());
        });
    });
}

// ----------------------
// Simulate Bus Movement + ML ETA
// ----------------------
setInterval(async () => {

    for (let bus of buses) {

        // Move latitude slightly
        bus.lat += 0.001;
        if (bus.lat > 13.20) bus.lat = 13.05;

        // Get traffic label
        bus.traffic = getTrafficLevel();

        try {
            // Predict ETA using ML
            const predictedETA = await predictETA(bus);
            bus.eta = Math.round(predictedETA);

        } catch (err) {
            console.log("Prediction failed. Using fallback ETA.");
            bus.eta = Math.round((bus.distance / bus.speed) * 60);
        }

        // Store ETA history
        if (!etaHistoryLog[bus.id]) {
            etaHistoryLog[bus.id] = [];
        }

        etaHistoryLog[bus.id].push(bus.eta);

        if (etaHistoryLog[bus.id].length > 100) {
            etaHistoryLog[bus.id].shift();
        }
    }

    io.emit("busData", buses);
    io.emit("etaHistory", etaHistoryLog);

}, 3000);
// ----------------------
// Critical Alert Detection
// ----------------------
setInterval(() => {
    buses.forEach(bus => {

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
}, 3000);

// ----------------------
// WebSocket
// ----------------------
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("busData", buses);
    socket.emit("etaHistory", etaHistoryLog);

    socket.on("setTraffic", (level) => {
        manualTrafficOverride = level;
        console.log("Manual traffic set to:", level);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// ----------------------
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});