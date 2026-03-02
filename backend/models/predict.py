#!/usr/bin/env python3
import sys
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path

def load_model():
    """Load the trained traffic prediction model"""
    model_path = Path(__file__).parent / "traffic_model.pkl"
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        # Return a fallback model or None
        return None

def create_fallback_model():
    """Create a simple fallback model for testing"""
    from sklearn.ensemble import RandomForestClassifier
    
    # Create a simple model for testing
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    
    # Create some dummy training data
    X = np.array([
        [8, 0, 0, 1, 0, 0],  # Monday, KN 1 Rd, High density, No rain, No holiday
        [8, 0, 1, 1, 0, 0],  # Monday, KN 3 Rd, High density, No rain, No holiday
        [8, 0, 2, 1, 0, 0],  # Monday, KG 11 Ave, High density, No rain, No holiday
        [8, 0, 3, 1, 0, 0],  # Monday, KK 15 Rd, High density, No rain, No holiday
        [8, 0, 4, 1, 0, 0],  # Monday, RN1, High density, No rain, No holiday
        [18, 0, 0, 1, 0, 0], # Monday, KN 1 Rd, High density, No rain, No holiday (peak hour)
        [8, 0, 0, 1, 1, 0],  # Monday, KN 1 Rd, High density, Rain, No holiday
        [8, 0, 0, 1, 0, 1],  # Monday, KN 1 Rd, High density, No rain, Holiday
    ])
    
    y = np.array(['High', 'Medium', 'Low', 'Medium', 'Low', 'High', 'High', 'Low'])
    
    model.fit(X, y)
    return model

def preprocess_input(data):
    """Preprocess input data for the model"""
    # Convert input to DataFrame
    df = pd.DataFrame([data])
    
    # Ensure all required columns are present
    required_columns = ['Hour', 'Day_of_Week', 'Road_Name', 'Population_Density', 'Rainfall', 'Public_Holiday']
    
    for col in required_columns:
        if col not in df.columns:
            print(f"Missing required column: {col}", file=sys.stderr)
            return None
    
    # Convert categorical variables to numerical
    # Day of week mapping
    day_mapping = {
        'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
        'Friday': 4, 'Saturday': 5, 'Sunday': 6
    }
    
    # Road mapping
    road_mapping = {
        'KN 1 Rd': 0, 'KN 3 Rd': 1, 'KG 11 Ave': 2, 'KK 15 Rd': 3, 'RN1': 4
    }
    
    # Convert to numerical features
    df['Day_of_Week'] = df['Day_of_Week'].map(day_mapping)
    df['Road_Name'] = df['Road_Name'].map(road_mapping)
    df['Population_Density'] = (df['Population_Density'] == 'High').astype(int)
    df['Rainfall'] = (df['Rainfall'] == 'Yes').astype(int)
    df['Public_Holiday'] = (df['Public_Holiday'] == 'Yes').astype(int)
    
    # Convert to numpy array without feature names
    features = df[['Hour', 'Day_of_Week', 'Road_Name', 'Population_Density', 'Rainfall', 'Public_Holiday']].values
    
    return features

def predict_traffic(input_data):
    """Make traffic prediction using the loaded model"""
    try:
        # Load model
        model = load_model()
        if model is None:
            print("Using fallback model due to loading error", file=sys.stderr)
            model = create_fallback_model()
        
        # Preprocess input
        df = preprocess_input(input_data)
        if df is None:
            return {"error": "Invalid input data"}
        
        # Make prediction
        prediction = model.predict(df)
        prediction_proba = model.predict_proba(df)
        
        # Get prediction probabilities
        if hasattr(model, 'classes_'):
            classes = model.classes_
        else:
            # Default classes if not available
            classes = ['Low', 'Medium', 'High']
        
        # Create probability dictionary
        proba_dict = {}
        for i, class_name in enumerate(classes):
            proba_dict[class_name] = float(prediction_proba[0][i])
        
        # Get the predicted class
        predicted_class = str(prediction[0])
        
        # Calculate confidence (highest probability)
        confidence = max(proba_dict.values()) * 100
        
        return {
            "prediction": predicted_class,
            "confidence": round(confidence, 1),
            "probabilities": proba_dict,
            "success": True
        }
        
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        return {"error": str(e)}

if __name__ == "__main__":
    # Read input from stdin
    try:
        input_json = sys.stdin.read()
        input_data = json.loads(input_json)
        
        # Make prediction
        result = predict_traffic(input_data)
        
        # Output result to stdout
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"Script error: {str(e)}"})) 