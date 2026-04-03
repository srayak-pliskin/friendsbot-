// Vercel Serverless Function - Gemini API with STREAMING support
import { queryKnowledge } from './pinecone-query.js';

export default async function handler(request, response) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages, systemPrompt, character, userQuery } = request.body;

  if (!messages || !systemPrompt) {
    response.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Fetch knowledge from Pinecone vector database
    let knowledgeText = '';
    if (character && userQuery) {
      knowledgeText = await queryKnowledge(character, userQuery);
    }

    // Build full system prompt with knowledge
    const fullSystemPrompt = knowledgeText
      ? `${systemPrompt}\n\nHere is your character knowledge:\n${knowledgeText}`
      : systemPrompt;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Convert to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Call Gemini API - non-streaming for JSON response
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: fullSystemPrompt }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Gemini API error:', errorData);
      return response.status(apiResponse.status).json({
        error: errorData.error?.message || 'Gemini API error'
      });
    }

    const data = await apiResponse.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    response.status(200).json({ content });

  } catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
