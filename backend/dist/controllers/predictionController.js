"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictTraffic = void 0;
const predictTraffic = async (req, res) => {
    try {
        const { Hour, Day_of_Week, Road_Name, Population_Density, Rainfall, Public_Holiday } = req.body;
        if (!Hour || !Day_of_Week || !Road_Name || !Population_Density || !Rainfall || !Public_Holiday) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['Hour', 'Day_of_Week', 'Road_Name', 'Population_Density', 'Rainfall', 'Public_Holiday']
            });
        }
        const inputData = {
            Hour,
            Day_of_Week,
            Road_Name,
            Population_Density,
            Rainfall,
            Public_Holiday
        };
        const modelResult = await callDeployedModel(inputData);
        if (modelResult.error) {
            console.error('ML Model Error:', modelResult.error);
            return res.status(500).json({
                error: 'Model prediction failed',
                details: modelResult.error
            });
        }
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
    }
    catch (error) {
        console.error('Error in traffic prediction:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.predictTraffic = predictTraffic;
async function callDeployedModel(inputData) {
    try {
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
        if (result.prediction) {
            return {
                prediction: result.prediction,
                confidence: result.confidence || 75,
                probabilities: result.probabilities || {},
                success: true
            };
        }
        else if (result.traffic_level) {
            return {
                prediction: result.traffic_level,
                confidence: result.confidence || 75,
                probabilities: result.probabilities || {},
                success: true
            };
        }
        else if (result.Congestion_Level) {
            return {
                prediction: result.Congestion_Level,
                confidence: result.confidence_score ? result.confidence_score * 100 : 75,
                probabilities: result.probabilities || {},
                success: true
            };
        }
        else {
            return {
                error: 'Invalid response format from deployed model',
                prediction: 'Medium',
                confidence: 50
            };
        }
    }
    catch (error) {
        console.error('Error calling deployed model:', error);
        return {
            error: `Failed to call deployed model: ${error}`,
            prediction: 'Medium',
            confidence: 50
        };
    }
}
function generateRecommendations(prediction, rainfall) {
    const recommendations = [];
    if (prediction === 'High') {
        recommendations.push('Consider alternative routes');
        recommendations.push('Allow extra travel time');
        recommendations.push('Check real-time updates');
    }
    else if (prediction === 'Medium') {
        recommendations.push('Plan your route in advance');
        recommendations.push('Monitor traffic updates');
    }
    else {
        recommendations.push('Normal travel conditions expected');
        recommendations.push('Standard travel time should be sufficient');
    }
    if (rainfall === 'Yes') {
        recommendations.push('Drive carefully in wet conditions');
    }
    return recommendations;
}
