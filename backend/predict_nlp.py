import sys
import joblib

# Load model
model = joblib.load("nlp_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# Get user message
message = sys.argv[1]

# Transform and predict
X = vectorizer.transform([message])
intent = model.predict(X)[0]

print(intent)