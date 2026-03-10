import React from "react";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1 className="title">🚌 NextStop</h1>

      <div className="card">
        <h2>Route 22B – City Center</h2>
        <p className="eta">Next Bus Arrival: 5 mins</p>
        <button className="track-btn">Track Bus</button>
      </div>

      <div className="chatbot">
        <h3>💬 Navis AI Assistant</h3>
        <button className="chat-btn">Ask about delays</button>
      </div>
    </div>
  );
}

export default App;
