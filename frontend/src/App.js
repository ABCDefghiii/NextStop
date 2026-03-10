import React, { useState, useEffect, useRef } from "react";
import BusCard from "./components/BusCard";
import MapView from "./components/MapView";
import AnalyticsPanel from "./components/AnalyticsPanel";
import LiveChart from "./components/LiveChart";
import SystemOverview from "./components/SystemOverview";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [etaHistory, setEtaHistory] = useState({});
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);

  // 🔌 WebSocket Connection (RUNS ONLY ONCE)
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("busData", (data) => {
      setBuses(data);
    });

    socketRef.current.on("etaHistory", (historyData) => {
      setEtaHistory(historyData);
    });

    socketRef.current.on("criticalAlert", (data) => {
      setAlerts((prev) => [
        { ...data, id: Date.now() },
        ...prev,
      ]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 🚌 Auto select first bus
  useEffect(() => {
    if (buses.length > 0 && selectedBusId === null) {
      setSelectedBusId(buses[0].id);
    }
  }, [buses, selectedBusId]);

  const selectedBus = buses.find((bus) => bus.id === selectedBusId);

  // 🛠 Admin Traffic Control
  const setTrafficLevel = (level) => {
    if (socketRef.current) {
      socketRef.current.emit("setTraffic", level);
    }
  };

  // 🤖 Navis AI Logic
  const handleAsk = () => {
    if (!selectedBus || !userMessage.trim()) return;

    const message = userMessage.toLowerCase();
    let response = "";

    if (message.includes("hi") || message.includes("hello")) {
      response = "👋 Hello! How can I assist you with your bus today?";
    } else if (
      message.includes("when") ||
      message.includes("eta") ||
      message.includes("arrival") ||
      message.includes("bus")
    ) {
      if (selectedBus.eta <= 1) {
        response = "🚌 Your bus is arriving now!";
      } else {
        response = `🚌 Route ${selectedBus.route} will arrive in ${selectedBus.eta} minutes.`;
      }
    } else {
      response =
        "🤖 I can help you with bus arrival times. Try asking 'When is the next bus?'";
    }

    setChatHistory((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
      { sender: "ai", text: response },
    ]);

    setUserMessage("");
  };

  // 🩺 Health Score Calculator (for overview)
  const calculateHealth = (bus) => {
    let score = 100;

    if (bus.traffic === "High") score -= 25;
    else if (bus.traffic === "Medium") score -= 15;

    if (bus.eta > 15) score -= 25;
    else if (bus.eta > 10) score -= 15;

    return Math.max(score, 0);
  };

  return (
    <div className="app">
      <h1 className="title">🚌 NextStop</h1>

      <SystemOverview buses={buses} calculateHealth={calculateHealth} />

      {/* Route Selector */}
      <select
        value={selectedBusId || ""}
        onChange={(e) => setSelectedBusId(Number(e.target.value))}
        style={{ marginBottom: "20px", padding: "8px" }}
      >
        {buses.map((bus) => (
          <option key={bus.id} value={bus.id}>
            {bus.route}
          </option>
        ))}
      </select>






      {/* Map */}
      {selectedBus && <MapView buses={[selectedBus]} />}

      {/* Bus Card */}
      {selectedBus && (
        <BusCard
          route={selectedBus.route}
          eta={selectedBus.eta}
          traffic={selectedBus.traffic}
        />
      )}

      {/* Analytics */}
      {selectedBus && etaHistory[selectedBus.id] && (
        <AnalyticsPanel
          bus={selectedBus}
          history={etaHistory[selectedBus.id]}
        />
      )}

      {/* Live Chart */}
      {selectedBus && etaHistory[selectedBus.id] && (
        <LiveChart history={etaHistory[selectedBus.id]} />
      )}

      {/* Admin Panel */}
      <div className="admin-panel">
        <h3>🛠 Admin Traffic Control</h3>
        <div className="admin-buttons">
          <button onClick={() => setTrafficLevel("Low")}>Low</button>
          <button onClick={() => setTrafficLevel("Medium")}>Medium</button>
          <button onClick={() => setTrafficLevel("High")}>High</button>
          <button onClick={() => setTrafficLevel(null)}>Auto</button>
        </div>
      </div>

      {/* Alert Log */}
      <div className="alert-log">
        <h3>🚨 Alert Log</h3>
        {alerts.length === 0 && <p>No alerts.</p>}
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            {alert.route} entered critical state at {alert.timestamp}
          </div>
        ))}
      </div>



      {/* Chatbot */}
      <div className="chatbot">
        <h3>💬 Navis AI Assistant</h3>

        <div className="chat-window">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender === "user"
                  ? "chat-bubble user"
                  : "chat-bubble ai"
              }
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Ask about your bus..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
          <button onClick={handleAsk}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;