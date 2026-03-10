import pandas as pd
import numpy as np
import random

# Number of samples
num_samples = 5000

routes = {
    1: (12, 18),   # Short-medium
    2: (20, 30),   # Medium
    3: (30, 45)    # Long
}

traffic_levels = ["Low", "Medium", "High"]

data = []

for _ in range(num_samples):
    route_id = random.choice(list(routes.keys()))
    
    # Distance range based on route
    distance = round(random.uniform(routes[route_id][0], routes[route_id][1]), 2)
    
    speed = round(random.uniform(25, 55), 2)
    
    hour = random.randint(0, 23)
    day = random.randint(0, 6)
    
    # Traffic probability (higher during peak hours)
    if 7 <= hour <= 10 or 16 <= hour <= 19:
        traffic = random.choices(
            traffic_levels, weights=[0.2, 0.4, 0.4]
        )[0]
    else:
        traffic = random.choices(
            traffic_levels, weights=[0.5, 0.3, 0.2]
        )[0]
    
    # Traffic multiplier
    multiplier = {
        "Low": 1.0,
        "Medium": 1.25,
        "High": 1.6
    }[traffic]
    
    base_eta = (distance / speed) * 60
    actual_eta = round(base_eta * multiplier + random.uniform(-2, 2), 2)
    
    previous_eta = round(actual_eta + random.uniform(-3, 3), 2)
    
    data.append([
        route_id, distance, speed, traffic,
        hour, day, previous_eta, actual_eta
    ])

columns = [
    "route_id", "distance_km", "speed_kmph",
    "traffic_level", "hour_of_day",
    "day_of_week", "previous_eta", "actual_eta"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("bus_eta_dataset.csv", index=False)

print("Dataset generated successfully!")
print(df.head())