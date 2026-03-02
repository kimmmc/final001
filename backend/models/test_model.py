#!/usr/bin/env python3
import pickle
import sys
from pathlib import Path

def test_model_loading():
    """Test if the model can be loaded"""
    try:
        model_path = Path(__file__).parent / "traffic_model.pkl"
        print(f"Attempting to load model from: {model_path}")
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        print("✅ Model loaded successfully!")
        print(f"Model type: {type(model)}")
        
        # Try to get model attributes
        if hasattr(model, 'classes_'):
            print(f"Model classes: {model.classes_}")
        
        if hasattr(model, 'feature_names_in_'):
            print(f"Feature names: {model.feature_names_in_}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

if __name__ == "__main__":
    success = test_model_loading()
    sys.exit(0 if success else 1) 