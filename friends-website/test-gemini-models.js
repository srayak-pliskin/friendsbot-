// Test script to check which Gemini models are available with your API key
// Run this with: node test-gemini-models.js

const GOOGLE_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual key

async function listAvailableModels() {
  try {
    console.log('Checking available Gemini models...\n');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error:', data);
      return;
    }
    
    console.log('Available models that support generateContent:\n');
    
    data.models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .forEach(m => {
        console.log(`✓ ${m.name}`);
        console.log(`  Display Name: ${m.displayName}`);
        console.log(`  Description: ${m.description}`);
        console.log('');
      });
      
  } catch (error) {
    console.error('Failed to fetch models:', error);
  }
}

listAvailableModels();
