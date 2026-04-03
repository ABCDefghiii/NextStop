import numpy as np
from sklearn.linear_model import LinearRegression
import pickle

# Sample training data (you can improve later)
# [distance, speed, traffic_level]
X = np.array([
    [5, 40, 1],
    [10, 35, 2],
    [7, 30, 3],
    [3, 45, 1],
    [8, 25, 3],
    [6, 50, 1],
    [9, 20, 3],
    [4, 35, 2]
])

# ETA values
y = np.array([8, 20, 25, 5, 30, 6, 35, 10])

model = LinearRegression()
model.fit(X, y)

# Save model
with open("eta_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved!")