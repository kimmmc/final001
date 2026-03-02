// Test script to verify deployed model integration

async function testDeployedModel() {
  console.log('Testing deployed model integration...');
  
  const testData = {
    Hour: 8,
    Day_of_Week: 'Monday',
    Road_Name: 'KN 1 Rd',
    Population_Density: 'High',
    Rainfall: 'No',
    Public_Holiday: 'No'
  };

  try {
    console.log('Sending test data to deployed model:', testData);
    
    const response = await fetch('https://model-1-jqxr.onrender.com/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      timeout: 10000,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Deployed model error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Deployed model response:', result);
    
    if (result.prediction || result.traffic_level) {
      console.log('✅ Model integration successful!');
      console.log('Prediction:', result.prediction || result.traffic_level);
      console.log('Confidence:', result.confidence);
    } else {
      console.log('⚠️ Unexpected response format:', result);
    }
    
  } catch (error) {
    console.error('❌ Error testing deployed model:', error);
  }
}

// Test the backend endpoint
async function testBackendEndpoint() {
  console.log('\nTesting backend endpoint...');
  
  const testData = {
    Hour: 8,
    Day_of_Week: 'Monday',
    Road_Name: 'KN 1 Rd',
    Population_Density: 'High',
    Rainfall: 'No',
    Public_Holiday: 'No'
  };

  try {
    console.log('Sending test data to backend:', testData);
    
    const response = await fetch('https://capstone1-60ax.onrender.com/api/predict-traffic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      timeout: 15000,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Backend response:', result);
    
    if (result.prediction) {
      console.log('✅ Backend integration successful!');
      console.log('Prediction:', result.prediction);
      console.log('Confidence:', result.confidence);
      console.log('Description:', result.description);
      console.log('Recommendations:', result.recommendations);
    } else {
      console.log('⚠️ Unexpected backend response format:', result);
    }
    
  } catch (error) {
    console.error('❌ Error testing backend:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting deployed model integration tests...\n');
  
  await testDeployedModel();
  await testBackendEndpoint();
  
  console.log('\n✨ Tests completed!');
}

runTests(); 