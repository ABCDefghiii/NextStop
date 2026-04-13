from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load ONCE at startup — stays in memory forever
model = joblib.load("nlp_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

@app.route("/predict", methods=["GET"])
def predict():
    message = request.args.get("message", "")
    X = vectorizer.transform([message])
    intent = model.predict(X)[0]
    return jsonify({ "intent": intent })

if __name__ == "__main__":
    app.run(port=5001)