import json
import random
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# Load dataset
with open("chatbot_dataset.json") as file:
    data = json.load(file)

texts = []
labels = []

# Prepare training data
for intent in data["intents"]:
    for pattern in intent["patterns"]:
        texts.append(pattern)
        labels.append(intent["tag"])

# Convert text to numbers
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

# Train model
model = MultinomialNB()
model.fit(X, labels)

# Save model
joblib.dump(model, "chatbot_model.pkl")
joblib.dump(vectorizer, "chatbot_vectorizer.pkl")

print("Chatbot model trained and saved!")
