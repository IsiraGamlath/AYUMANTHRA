// Simple test to check if backend is accessible
import axios from 'axios';

const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await axios.get('http://localhost:5011/campaigns');
    console.log('✅ Backend connected successfully!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return false;
  }
};

// Test campaign creation
const testCampaignCreation = async () => {
  try {
    console.log('Testing campaign creation...');
    const campaignData = {
      campaignName: "Test Campaign",
      description: "This is a test campaign to verify database connection",
      status: "active",
      deadline: "2024-12-31",
      participants: 100,
      rating: 4.5,
      discount: 10,
      imageUrl: "https://via.placeholder.com/300x200"
    };
    
    const response = await axios.post('http://localhost:5011/campaigns', campaignData);
    console.log('✅ Campaign created successfully!');
    console.log('Created campaign:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Campaign creation failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
};

export { testBackendConnection, testCampaignCreation };