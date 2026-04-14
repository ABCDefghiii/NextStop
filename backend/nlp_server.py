from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import re

app = Flask(__name__)
CORS(app)

# Load intents
with open("intents.json", "r") as f:
    data = json.load(f)

def predict_intent(message):
    message = message.lower().strip()

    best_intent = "greeting"
    best_score = 0

    for intent in data["intents"]:
        for pattern in intent["patterns"]:
            pattern_words = set(re.findall(r'\w+', pattern.lower()))
            message_words = set(re.findall(r'\w+', message))
            common = pattern_words & message_words
            score = len(common) / max(len(pattern_words), 1)
            if score > best_score:
                best_score = score
                best_intent = intent["tag"]

    # Fallback keyword rules for robustness
    if any(w in message for w in ["eta", "arrive", "arrival", "minutes", "long", "when"]):
        best_intent = "eta"
    elif any(w in message for w in ["traffic", "road", "congestion"]):
        best_intent = "traffic"
    elif any(w in message for w in ["distance", "far", "km", "close"]):
        best_intent = "distance"
    elif any(w in message for w in ["speed", "fast", "slow", "moving"]):
        best_intent = "speed"
    elif any(w in message for w in ["route", "goes", "direction", "path"]):
        best_intent = "route"
    elif any(w in message for w in ["where", "location", "position", "track"]):
        best_intent = "location"
    elif any(w in message for w in ["how many", "count", "total", "number"]):
        best_intent = "count"
    elif any(w in message for w in ["delay", "late", "delayed"]):
        best_intent = "delay"
    elif any(w in message for w in ["fastest", "quickest", "first"]):
        best_intent = "fastest"
    elif any(w in message for w in ["hello", "hi", "hey"]):
        best_intent = "greeting"

    return best_intent

@app.route("/predict", methods=["GET"])
def predict():
    message = request.args.get("message", "")
    if not message:
        return jsonify({"intent": "greeting"})
    intent = predict_intent(message)
    return jsonify({"intent": intent})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=5001, debug=True)