// Shared Pinecone query module for Vercel serverless functions
// Singleton client reused across warm invocations

let _pineconeHost = null;

async function getPineconeHost() {
  if (_pineconeHost) return _pineconeHost;

  const indexName = process.env.PINECONE_INDEX || 'friends-chatbot';
  const res = await fetch(
    `https://api.pinecone.io/indexes/${indexName}`,
    { headers: { 'Api-Key': process.env.PINECONE_API_KEY } }
  );
  if (!res.ok) throw new Error(`Pinecone index lookup failed: ${res.status}`);
  const data = await res.json();
  _pineconeHost = data.host;
  return _pineconeHost;
}

async function embedQuery(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_QUERY',
      outputDimensionality: 768,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

/**
 * Query Pinecone for relevant character knowledge
 * @param {string} characterKey - e.g. 'rachel', 'ross'
 * @param {string} userQuery - the user's message
 * @param {number} topK - number of results to return
 * @returns {string} concatenated knowledge text
 */
export async function queryKnowledge(characterKey, userQuery, topK = 5) {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('PINECONE_API_KEY not set, skipping knowledge retrieval');
    return '';
  }

  try {
    const [host, queryVector] = await Promise.all([
      getPineconeHost(),
      embedQuery(userQuery),
    ]);

    const res = await fetch(`https://${host}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespace: characterKey,
        vector: queryVector,
        topK,
        includeMetadata: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Pinecone query error: ${res.status} ${err}`);
      return '';
    }

    const data = await res.json();
    const matches = (data.matches || []).filter(m => m.score > 0.3);

    if (matches.length === 0) return '';

    const knowledgeText = matches
      .map(m => `=== ${m.metadata.heading} ===\n${m.metadata.text}`)
      .join('\n\n');

    return knowledgeText;
  } catch (err) {
    console.error('Knowledge retrieval error:', err.message);
    return '';
  }
}
