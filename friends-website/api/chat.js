// Vercel Serverless Function - Google Gemini API (Stable Models)
export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
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

  const { messages, systemPrompt, rentryUrls } = request.body;

  if (!messages || !systemPrompt) {
    response.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Fetch Rentry knowledge pages server-side (avoids CORS issues)
    let knowledgeText = '';
    if (rentryUrls && rentryUrls.length > 0) {
      const fetchPromises = rentryUrls.map(url =>
        fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        .then(r => r.ok ? r.text() : '')
        .catch(() => '')
      );
      const results = await Promise.all(fetchPromises);
      knowledgeText = results.filter(Boolean).join('\n\n');
    }

    // Build full system prompt with knowledge
    const fullSystemPrompt = knowledgeText
      ? `${systemPrompt}\n\nHere is your character knowledge:\n${knowledgeText}`
      : systemPrompt;

    // Use gemini-1.5-pro - current stable version (as of Feb 2026)
    // Alternative: gemini-2.5-pro (if available on your account)
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

    // Convert to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add system prompt as first user message
    geminiMessages.unshift({
      role: 'user',
      parts: [{ text: fullSystemPrompt }]
    });
    geminiMessages.splice(1, 0, {
      role: 'model',
      parts: [{ text: 'Understood! I will stay in character.' }]
    });

    // Call Gemini API with v1beta endpoint
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Gemini API error:', data);
      response.status(apiResponse.status).json({ 
        error: data.error?.message || 'Gemini API error' 
      });
      return;
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    response.status(200).json({ content: text || 'No response generated' });

  } catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
