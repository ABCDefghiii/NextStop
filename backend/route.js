const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  route_name: String,
  stops: [
    {
      name: String,
      lat: Number,
      lng: Number
    }
  ]
});

module.exports = mongoose.model("Route", routeSchema);