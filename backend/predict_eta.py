import sys
import json
import joblib
import pandas as pd

# Load model
model = joblib.load("best_eta_model.pkl")

# Get input data from Node
input_json = sys.stdin.read()
data = json.loads(input_json)

df = pd.DataFrame([data])

prediction = model.predict(df)

print(round(float(prediction[0]), 2))