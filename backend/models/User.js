const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "driver", "admin"], required: true },

    // Driver specific
    busNumber: { type: Number, default: null },
    routeKey: { type: String, default: null },
    route: { type: String, default: null },
    isActive: { type: Boolean, default: false }, // true when driver is on trip

    // Student specific
    preferredRoute: { type: String, default: null },
});

module.exports = mongoose.model("User", userSchema);