import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# Training data
data = {
    "text": [

        # GREETINGS
        "hello", "hi", "hey", "good morning", "good evening",

        # ETA
        "when will my bus arrive",
        "how long for bus",
        "eta of bus",
        "when will it reach",
        "arrival time",

        # TRAFFIC
        "is there traffic",
        "traffic condition",
        "where is traffic high",
        "which route has less traffic",
        "traffic status",

        # DISTANCE
        "how far is bus",
        "distance to stop",
        "how far away",

        # SPEED
        "speed of bus",
        "how fast is bus",
        "bus speed",

        # FASTEST
        "which bus is fastest",
        "fastest route",
        "fast bus",

        # ROUTE
        "which route is this bus",
        "bus route",
        "where is this bus going",

        # COUNT
        "how many buses are running",
        "number of buses",
        "total buses",

        # DELAY
        "is bus delayed",
        "delay in bus",
        "will my bus be late",

        # LOCATION
        "where is my bus",
        "current location of bus",
        "bus location"
    ],

    "intent": [

        "greeting","greeting","greeting","greeting","greeting",

        "eta","eta","eta","eta","eta",

        "traffic","traffic","traffic","traffic","traffic",

        "distance","distance","distance",

        "speed","speed","speed",

        "fastest","fastest","fastest",

        "route","route","route",

        "count","count","count",

        "delay","delay","delay",

        "location","location","location"
    ]
}

df = pd.DataFrame(data)

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["text"])

model = LogisticRegression()
model.fit(X, df["intent"])

# Save model
joblib.dump(model, "nlp_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("NLP model trained!")