# ML Model Directory

## Traffic Prediction Model

This directory is for storing the trained machine learning model for traffic prediction.

### File Placement

Place your trained model pickle file here with the name `traffic_prediction_model.pkl`

### Expected Model Interface

The model should accept the following input features:
- `Hour`: Hour of day (0-23)
- `Day_of_Week`: Day of week (Monday, Tuesday, etc.)
- `Road_Name`: Road name (KG 11 Ave, KK 15 Rd, etc.)
- `Population_Density`: Population density (Medium, High)
- `Rainfall`: Rainfall condition (No, Yes)
- `Public_Holiday`: Public holiday (No, Yes)

### Model Integration

To integrate your trained model:

1. Place the pickle file in this directory
2. Update the `predictionController.ts` to load and use your model
3. Replace the mock prediction logic with actual model inference

### Example Model Loading

```typescript
import pickle from 'pickle-mustard'; // or your preferred pickle library

// Load the model
const model = pickle.load('models/traffic_prediction_model.pkl');

// Use the model for predictions
const prediction = model.predict([features]);
```

### Current Implementation

Currently using mock prediction logic in `predictionController.ts`. Replace this with your actual model inference. 