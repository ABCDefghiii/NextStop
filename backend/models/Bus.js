const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    route: { type: String },
    routeKey: { type: String },
    speed: { type: Number },
    distance: { type: Number },
    lat: { type: Number },
    lng: { type: Number },
    pathIndex: { type: Number, default: 0 },
    eta: { type: Number, default: 0 },
    traffic: { type: String, default: "Low" },
    confidence: { type: Number, default: 90 },
    isRealGPS: { type: Boolean, default: false } // true when driver is streaming real GPS
});

module.exports = mongoose.model("Bus", busSchema);