import sys
import json
import joblib
import pandas as pd
from datetime import datetime

# Load ML model
model = joblib.load("best_eta_model.pkl")

try:

    input_json = sys.stdin.read()
    buses = json.loads(input_json)

    rows = []

    for bus in buses:

        row = {
            "route_id": bus.get("id", 0),
            "distance_km": bus.get("distance", 5),
            "speed_kmph": bus.get("speed", 30),
            "traffic_level": bus.get("traffic", "Low"),
            "hour_of_day": datetime.now().hour,
            "day_of_week": datetime.now().weekday(),
            "previous_eta": bus.get("eta", 10)
        }

        rows.append(row)

    df = pd.DataFrame(rows)

    predictions = model.predict(df)

    result = [round(float(p), 2) for p in predictions]

    print(json.dumps(result))

except Exception as e:

    print("MODEL ERROR:", str(e), file=sys.stderr)
    print(json.dumps([5]))