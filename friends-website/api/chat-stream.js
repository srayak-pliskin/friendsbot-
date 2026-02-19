// Vercel Serverless Function - Streaming Gemini API
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
    // Fetch Rentry knowledge pages server-side
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

    // Build full system prompt
    const fullSystemPrompt = knowledgeText
      ? `${systemPrompt}\n\nHere is your character knowledge:\n${knowledgeText}`
      : systemPrompt;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Convert to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add system prompt
    geminiMessages.unshift({
      role: 'user',
      parts: [{ text: fullSystemPrompt }]
    });
    geminiMessages.splice(1, 0, {
      role: 'model',
      parts: [{ text: 'Understood! I will stay in character.' }]
    });

    // Call Gemini API for streaming
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${process.env.GOOGLE_API_KEY}&alt=sse`,
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

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Gemini API error:', errorData);
      response.status(apiResponse.status).json({ 
        error: errorData.error?.message || 'Gemini API error' 
      });
      return;
    }

    // Set up SSE (Server-Sent Events) for streaming
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    const reader = apiResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
      
      for (const line of lines) {
        const data = line.replace('data:', '').trim();
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            response.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    response.write('data: [DONE]\n\n');
    response.end();

  } catch (error) {
    console.error('Error:', error);
    response.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
