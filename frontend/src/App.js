import React, { useState } from "react";
import "./App.css";

function App() {
  const [eta, setEta] = useState(5);

  const handleTrack = () => {
    if (eta > 1) {
      setEta(eta - 1);
    } else {
      setEta("Arriving");
    }
  };

  return (
    <div className="app">
      <h1 className="title">🚌 NextStop</h1>

      <div className="card">
        <h2>Route 22B – City Center</h2>
        <p className="eta">Next Bus Arrival: {eta} {eta !== "Arriving" ? "mins" : ""}</p>
        <button className="track-btn" onClick={handleTrack}>Track Bus</button>
      </div>

      <div className="chatbot">
        <h3>💬 Navis AI Assistant</h3>
        <button className="chat-btn">Ask about delays</button>
      </div>
    </div>
  );
}

export default App;
