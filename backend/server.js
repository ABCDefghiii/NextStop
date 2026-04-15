const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
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
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://next-stop-pi.vercel.app",
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
    family: 4
})
    .then(() => {
        console.log("MongoDB connected");
        seedData();
    })
    .catch((err) => console.error("MongoDB error:", err));

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected! Reconnecting...");
    mongoose.connect(process.env.MONGO_URI, { family: 4 });
});

// ----------------------
// SEED BUSES
// ----------------------
async function seedBuses() {
    const count = await Bus.countDocuments();
    if (count === 0) {
        await Bus.insertMany([
            { id: 1, route: "Yanam Route", routeKey: "route1", speed: 35, distance: 5, lat: 16.7333, lng: 82.2167, pathIndex: 0 },
            { id: 2, route: "Yanam Route", routeKey: "route1", speed: 34, distance: 5, lat: 16.75, lng: 82.23, pathIndex: 3 },
            { id: 3, route: "Uppada Route", routeKey: "route2", speed: 40, distance: 5, lat: 16.98, lng: 82.35, pathIndex: 0 },
            { id: 4, route: "Uppada Route", routeKey: "route2", speed: 38, distance: 5, lat: 17.00, lng: 82.34, pathIndex: 2 },
            { id: 5, route: "Pithapuram Route", routeKey: "route3", speed: 30, distance: 5, lat: 17.1167, lng: 82.2667, pathIndex: 0 }
        ]);
        console.log("Buses seeded");
    } else {
        console.log(`${count} buses already in DB`);
    }
}

// ----------------------
// SEED REAL USERS
// ----------------------
async function seedUsers() {
    const count = await User.countDocuments();
    if (count === 0) {
        await User.insertMany([
            // ADMIN
            { name: "Admin", phone: "0000000000", username: "admin", password: "admin123", role: "admin" },

            // DRIVERS
            { name: "Prameela", phone: "9553887646", username: "Driver1", password: "Prameela123", role: "driver", busNumber: 1, routeKey: "route1", route: "Yanam Route" },
            { name: "Karthik Ram", phone: "8639968779", username: "Driver2", password: "karthik123", role: "driver", busNumber: 5, routeKey: "route3", route: "Pithapuram Route" },
            { name: "Gorle Devendra", phone: "9701349587", username: "Driver3", password: "devendra123", role: "driver", busNumber: 2, routeKey: "route1", route: "Yanam Route" },
            { name: "Hema Teja", phone: "8309456611", username: "Driver4", password: "hemateja123", role: "driver", busNumber: 3, routeKey: "route2", route: "Uppada Route" },
            { name: "Satyavinay", phone: "8520855669", username: "Driver5", password: "vinay123", role: "driver", busNumber: 4, routeKey: "route2", route: "Uppada Route" },
            { name: "Bhargavi", phone: "7386007448", username: "Driver6", password: "bhargavi123", role: "driver", busNumber: 1, routeKey: "route1", route: "Yanam Route" },
            { name: "Meenakshi", phone: "9703894711", username: "Driver7", password: "meena123", role: "driver", busNumber: 5, routeKey: "route3", route: "Pithapuram Route" },
            { name: "Yashwanthi", phone: "9154199644", username: "Driver8", password: "Yashu123", role: "driver", busNumber: 2, routeKey: "route1", route: "Yanam Route" },
            { name: "Anusha", phone: "8885024647", username: "Driver9", password: "anusha123", role: "driver", busNumber: 3, routeKey: "route2", route: "Uppada Route" },
            { name: "Teja", phone: "7993479929", username: "Driver10", password: "teja123", role: "driver", busNumber: 4, routeKey: "route2", route: "Uppada Route" },

            // STUDENTS
            { name: "Shruthi Haasini", phone: "8499882288", username: "Student1", password: "shruthi234", role: "student", preferredRoute: "Pithapuram Route" },
            { name: "Kusuma", phone: "9515696117", username: "Student2", password: "kusuma234", role: "student", preferredRoute: "Uppada Route" },
            { name: "Deepthi", phone: "8317562323", username: "Student3", password: "deepthi234", role: "student", preferredRoute: "Yanam Route" },
            { name: "Yesu", phone: "7382045226", username: "Student4", password: "yesu234", role: "student", preferredRoute: "Pithapuram Route" },
            { name: "Bhanu", phone: "9703141983", username: "Student5", password: "bhanu234", role: "student", preferredRoute: "Yanam Route" },
            { name: "Simhadri", phone: "9392496375", username: "Student6", password: "simhadri234", role: "student", preferredRoute: "Pithapuram Route" },
            { name: "Sirisha", phone: "7207510243", username: "Student7", password: "sirisha234", role: "student", preferredRoute: "Uppada Route" },
            { name: "Sowmya", phone: "7207822314", username: "Student8", password: "sowmya234", role: "student", preferredRoute: "Pithapuram Route" },
            { name: "Pushpa", phone: "9014786629", username: "Student9", password: "pushpa234", role: "student", preferredRoute: "Uppada Route" },
            { name: "Harshitha", phone: "7569633887", username: "Student10", password: "harshi234", role: "student", preferredRoute: "Yanam Route" },
        ]);
        console.log("Users seeded — 1 admin, 10 drivers, 10 students");
    } else {
        console.log(`${count} users already in DB`);
    }
}

// ----------------------
// SEED ALL
// ----------------------
async function seedData() {
    await seedBuses();
    await seedUsers();
    startSimulation();
}

// ----------------------
// LOGIN — uses MongoDB
// ----------------------
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            return res.json({
                success: true,
                role: user.role,
                name: user.name,
                busNumber: user.busNumber || null,
                routeKey: user.routeKey || null,
                route: user.route || null,
                preferredRoute: user.preferredRoute || null,
            });
        }
        res.status(401).json({ success: false });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false });
    }
});

// ----------------------
// DRIVER GPS ENDPOINT
// ----------------------
app.post("/driver/location", async (req, res) => {
    const { username, lat, lng, busNumber } = req.body;
    try {
        await Bus.findOneAndUpdate(
            { id: busNumber },
            { $set: { lat: parseFloat(lat), lng: parseFloat(lng), isRealGPS: true } }
        );
        await User.findOneAndUpdate({ username }, { $set: { isActive: true } });
        res.json({ success: true });
    } catch (err) {
        console.error("GPS update error:", err);
        res.status(500).json({ success: false });
    }
});

// ----------------------
// DRIVER END TRIP
// ----------------------
app.post("/driver/endtrip", async (req, res) => {
    const { username } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { $set: { isActive: false } });
        // Reset bus back to simulation mode
        const driver = await User.findOne({ username });
        if (driver) {
            await Bus.findOneAndUpdate(
                { id: driver.busNumber },
                { $set: { isRealGPS: false } }
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// ----------------------
// GET DRIVERS (admin)
// ----------------------
app.get("/api/drivers", async (req, res) => {
    try {
        const drivers = await User.find({ role: "driver" }).select("-password");
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------
// GET STUDENTS (admin)
// ----------------------
app.get("/api/students", async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("-password");
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------
// TRAFFIC
// ----------------------
let manualTrafficOverride = null;

function getTrafficLevel() {
    if (manualTrafficOverride) return manualTrafficOverride;
    const hour = new Date().getHours();
    if ((hour >= 7 && hour < 10) || (hour >= 17 && hour < 20)) return "High";
    if (hour > 10 && hour < 17) return "Medium";
    return "Low";
}

// ----------------------
// HAVERSINE DISTANCE
// ----------------------
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const COLLEGE_LAT = 17.0005;
const COLLEGE_LNG = 82.2700;

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
    let lastMLCall = 0;
    let lastPredictions = [];

    setInterval(async () => {
        try {
            let busArray = await Bus.find().lean();

            // ----------------------
            // UPDATE BUS MOVEMENT
            // ----------------------
            busArray = busArray.map(bus => {
                if (bus.isRealGPS) {
                    bus.traffic = getTrafficLevel();
                    bus.distance = haversineDistance(bus.lat, bus.lng, COLLEGE_LAT, COLLEGE_LNG);
                    return bus;
                }

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
                bus.distance = haversineDistance(bus.lat, bus.lng, COLLEGE_LAT, COLLEGE_LNG);

                return bus;
            });

            // ----------------------
            // ✅ OPTIMIZED ML CALL
            // ----------------------
            let updatedBuses = busArray;

            if (Date.now() - lastMLCall > 15000) {
                await new Promise((resolve) => {
                    predictETAs(busArray, (result) => {
                        updatedBuses = result;
                        lastPredictions = result.map(b => b.eta);
                        lastMLCall = Date.now();
                        resolve();
                    });
                });
            } else {
                updatedBuses.forEach((bus, i) => {
                    bus.eta = lastPredictions[i] || Math.round((bus.distance / bus.speed) * 60);
                });
            }

            // ----------------------
            // SAVE + CONFIDENCE
            // ----------------------
            const etaHistoryLog = {};

            for (const bus of updatedBuses) {
                const etaDoc = await ETAHistory.findOneAndUpdate(
                    { busId: bus.id },
                    { $push: { history: { $each: [bus.eta], $slice: -100 } } },
                    { upsert: true, returnDocument: "after" }
                );

                bus.confidence = calculateConfidence(etaDoc.history);

                const updateFields = {
                    traffic: bus.traffic,
                    distance: bus.distance,
                    eta: bus.eta,
                    confidence: bus.confidence,
                    speed: bus.speed,
                    isRealGPS: bus.isRealGPS || false,
                };

                if (!bus.isRealGPS) {
                    updateFields.lat = bus.lat;
                    updateFields.lng = bus.lng;
                    updateFields.pathIndex = bus.pathIndex;
                }

                await Bus.findOneAndUpdate(
                    { id: bus.id },
                    { $set: updateFields }
                );

                etaHistoryLog[bus.id] = etaDoc.history;
            }

            // ----------------------
            // EMIT DATA
            // ----------------------
            io.emit("busData", updatedBuses);
            io.emit("etaHistory", etaHistoryLog);

        } catch (err) {
            console.error("Simulation error:", err.message);
        }

    }, 3000);
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
        const flaskURL = process.env.FLASK_URL;

        const nlpRes = await fetch(
            `${flaskURL}/predict?message=${encodeURIComponent(message)}`
        );

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