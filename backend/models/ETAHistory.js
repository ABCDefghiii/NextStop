const mongoose = require("mongoose");

const etaHistorySchema = new mongoose.Schema({
    busId: { type: Number, required: true, unique: true },
    history: { type: [Number], default: [] }
});

module.exports = mongoose.model("ETAHistory", etaHistorySchema);