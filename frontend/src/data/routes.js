module.exports = {
  routes: [
    {
      route_id: 1,
      route_name: "Yanam → Ideal College",

      stops: [
        { stop_id: 1, name: "Yanam", lat: 16.7333, lng: 82.2167 },
        { stop_id: 2, name: "Tallarevu", lat: 16.7800, lng: 82.2400 },
        { stop_id: 3, name: "Sarpavaram", lat: 16.9000, lng: 82.2500 },
        { stop_id: 4, name: "Kakinada", lat: 16.9891, lng: 82.2475 },
        { stop_id: 5, name: "Ideal College", lat: 17.0005, lng: 82.2700 }
      ],

      path: [
        { lat: 16.7450, lng: 82.2220 },
        { lat: 16.7550, lng: 82.2280 },
        { lat: 16.7650, lng: 82.2340 },
        { lat: 16.8000, lng: 82.2450 },
        { lat: 16.8300, lng: 82.2480 },
        { lat: 16.9400, lng: 82.2520 },
        { lat: 16.9600, lng: 82.2500 }
      ]
    }
  ]
};