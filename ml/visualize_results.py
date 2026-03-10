import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Load dataset
df = pd.read_csv("bus_eta_dataset.csv")

X = df.drop("actual_eta", axis=1)
y = df["actual_eta"]

categorical_features = ["traffic_level"]
numeric_features = [
    "route_id",
    "distance_km",
    "speed_kmph",
    "hour_of_day",
    "day_of_week",
    "previous_eta"
]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(), categorical_features),
        ("num", "passthrough", numeric_features)
    ]
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

models = {
    "Linear Regression": LinearRegression(),
    "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
    "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, random_state=42)
}

mae_scores = []
rmse_scores = []
model_names = []

for name, model in models.items():
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model)
    ])
    
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    
    mae_scores.append(mae)
    rmse_scores.append(rmse)
    model_names.append(name)

# 📊 Bar Chart
x = np.arange(len(model_names))

plt.figure(figsize=(10, 5))
plt.bar(x - 0.2, mae_scores, width=0.4, label="MAE")
plt.bar(x + 0.2, rmse_scores, width=0.4, label="RMSE")

plt.xticks(x, model_names)
plt.ylabel("Error")
plt.title("Model Comparison (MAE & RMSE)")
plt.legend()
plt.show()

# 📈 Predicted vs Actual (Best Model)
best_model = LinearRegression()

best_pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", best_model)
])

best_pipeline.fit(X_train, y_train)
predictions = best_pipeline.predict(X_test)

plt.figure(figsize=(6, 6))
plt.scatter(y_test, predictions, alpha=0.5)
plt.xlabel("Actual ETA")
plt.ylabel("Predicted ETA")
plt.title("Actual vs Predicted ETA (Linear Regression)")
plt.plot([y_test.min(), y_test.max()],
         [y_test.min(), y_test.max()],
         color="red")
plt.show()