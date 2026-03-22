import sys
import joblib
import json
import random

# Load ML model and vectorizer
model = joblib.load("../ml/chatbot_model.pkl")
vectorizer = joblib.load("../ml/chatbot_vectorizer.pkl")

# Load response dataset
with open("../ml/chatbot_dataset.json") as file:
    data = json.load(file)

# -----------------------------
# INPUT FROM NODE
# -----------------------------

message = sys.argv[1].lower()

# Optional live data (if passed)
bus_data = None

if len(sys.argv) > 2:
    try:
        bus_data = json.loads(sys.argv[2])
    except:
        bus_data = None

# -----------------------------
# ML INTENT PREDICTION
# -----------------------------

X = vectorizer.transform([message])
intent = model.predict(X)[0]

# -----------------------------
# SMART RESPONSES
# -----------------------------

# If bus info available
if bus_data:

    bus = bus_data[0]

    if intent == "bus_eta":
        print(f"🚌 The {bus['route']} bus will arrive in {bus['eta']} minutes.")
        sys.exit()

    if intent == "bus_location":
        print(f"🚌 The {bus['route']} bus is currently moving with traffic level {bus['traffic']}.")
        sys.exit()

# Default responses from dataset
for item in data["intents"]:
    if item["tag"] == intent:
        response = random.choice(item["responses"])
        print(response)
        break