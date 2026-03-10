import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

# Load dataset
df = pd.read_csv("bus_eta_dataset.csv")

# Features and target
X = df.drop("actual_eta", axis=1)
y = df["actual_eta"]

# Identify categorical columns
categorical_features = ["traffic_level"]
numeric_features = [
    "route_id",
    "distance_km",
    "speed_kmph",
    "hour_of_day",
    "day_of_week",
    "previous_eta"
]

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(), categorical_features),
        ("num", "passthrough", numeric_features)
    ]
)

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Models
models = {
    "Linear Regression": LinearRegression(),
    "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
    "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, random_state=42)
}

results = {}

for name, model in models.items():
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ])
    
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    
    results[name] = {
        "MAE": round(mae, 2),
        "RMSE": round(rmse, 2)
    }
    
    print(f"\n{name}")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")

# Select best model (lowest RMSE)
best_model_name = min(results, key=lambda x: results[x]["RMSE"])
print(f"\nBest Model: {best_model_name}")

# Train best model again on full training data
best_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", models[best_model_name])
])

best_pipeline.fit(X_train, y_train)

# Save model
joblib.dump(best_pipeline, "best_eta_model.pkl")

print("\nModel saved as best_eta_model.pkl")