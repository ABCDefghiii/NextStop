import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";

import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {

  const [buses, setBuses] = useState([]);
  const [etaHistory, setEtaHistory] = useState({});
  const [alerts, setAlerts] = useState([]);

  const socketRef = useRef(null);

  useEffect(() => {

    // Connect to backend
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });
    // Receive live bus data
    socketRef.current.on("busData", (data) => {
      setBuses(data);
    });

    // Receive ETA history analytics
    socketRef.current.on("etaHistory", (historyData) => {
      setEtaHistory(historyData);
    });

    // Receive alerts
    socketRef.current.on("criticalAlert", (data) => {

      setAlerts((prevAlerts) => {

        const newAlert = {
          ...data,
          id: Date.now()
        };

        return [newAlert, ...prevAlerts];

      });

    });

    // Cleanup socket
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };

  }, []);

  return (

    <Router>

      <Routes>

        {/* Student Interface */}
        <Route
          path="/"
          element={
            <StudentDashboard
              buses={buses}
            />
          }
        />

        {/* Admin Interface */}
        <Route
          path="/admin"
          element={
            <AdminDashboard
              buses={buses}
              etaHistory={etaHistory}
              alerts={alerts}
            />
          }
        />

      </Routes>

    </Router>

  );

}

export default App;