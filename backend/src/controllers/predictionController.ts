import { Request, Response } from 'express';

interface PredictionRequest {
  Hour: number;
  Day_of_Week: string;
  Road_Name: string;
  Population_Density: string;
  Rainfall: string;
  Public_Holiday: string;
}

interface ModelPrediction {
  prediction: string;
  confidence: number;
  probabilities?: Record<string, number>;
  success?: boolean;
  error?: string;
}

export const predictTraffic = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      Hour,
      Day_of_Week,
      Road_Name,
      Population_Density,
      Rainfall,
      Public_Holiday
    }: PredictionRequest = req.body;

    // Validate required fields
    if (!Hour || !Day_of_Week || !Road_Name || !Population_Density || !Rainfall || !Public_Holiday) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['Hour', 'Day_of_Week', 'Road_Name', 'Population_Density', 'Rainfall', 'Public_Holiday']
      });
    }

    // Prepare input data for the model
    const inputData = {
      Hour,
      Day_of_Week,
      Road_Name,
      Population_Density,
      Rainfall,
      Public_Holiday
    };

    // Call deployed ML model
    const modelResult = await callDeployedModel(inputData);
    
    if (modelResult.error) {
      console.error('ML Model Error:', modelResult.error);
      return res.status(500).json({ 
        error: 'Model prediction failed',
        details: modelResult.error 
      });
    }

    // Generate recommendations based on prediction
    const recommendations = generateRecommendations(modelResult.prediction, Rainfall);

    const result = {
      prediction: modelResult.prediction,
      confidence: modelResult.confidence,
      description: `${modelResult.prediction} traffic expected on ${Road_Name}`,
      recommendations,
      analysis: {
        time: `${Hour}:00`,
        road: Road_Name,
        conditions: Rainfall === 'Yes' ? 'Rainy' : 'Clear',
        timestamp: new Date().toISOString()
      },
      probabilities: modelResult.probabilities
    };

    console.log('Traffic prediction:', {
      input: inputData,
      result
    });

    res.json(result);
  } catch (error) {
    console.error('Error in traffic prediction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

async function callDeployedModel(inputData: any): Promise<ModelPrediction> {
  try {
    // Call the deployed model at https://model-1-jqxr.onrender.com
    const response = await fetch('https://model-1-jqxr.onrender.com/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deployed model error:', response.status, errorText);
      return {
        error: `Model API error: ${response.status} - ${errorText}`,
        prediction: 'Medium',
        confidence: 50
      };
    }

    const result = await response.json();
    console.log('Deployed model response:', result);

    // Handle different response formats from the deployed model
    if (result.prediction) {
      return {
        prediction: result.prediction,
        confidence: result.confidence || 75,
        probabilities: result.probabilities || {},
        success: true
      };
    } else if (result.traffic_level) {
      // Handle alternative response format
      return {
        prediction: result.traffic_level,
        confidence: result.confidence || 75,
        probabilities: result.probabilities || {},
        success: true
      };
    } else if (result.Congestion_Level) {
      // Handle the actual deployed model response format
      return {
        prediction: result.Congestion_Level,
        confidence: result.confidence_score ? result.confidence_score * 100 : 75,
        probabilities: result.probabilities || {},
        success: true
      };
    } else {
      return {
        error: 'Invalid response format from deployed model',
        prediction: 'Medium',
        confidence: 50
      };
    }
  } catch (error) {
    console.error('Error calling deployed model:', error);
    return {
      error: `Failed to call deployed model: ${error}`,
      prediction: 'Medium',
      confidence: 50
    };
  }
}

function generateRecommendations(prediction: string, rainfall: string): string[] {
  const recommendations = [];
  
  if (prediction === 'High') {
    recommendations.push('Consider alternative routes');
    recommendations.push('Allow extra travel time');
    recommendations.push('Check real-time updates');
  } else if (prediction === 'Medium') {
    recommendations.push('Plan your route in advance');
    recommendations.push('Monitor traffic updates');
  } else {
    recommendations.push('Normal travel conditions expected');
    recommendations.push('Standard travel time should be sufficient');
  }
  
  // Add weather-specific recommendations
  if (rainfall === 'Yes') {
    recommendations.push('Drive carefully in wet conditions');
  }
  
  return recommendations;
} 