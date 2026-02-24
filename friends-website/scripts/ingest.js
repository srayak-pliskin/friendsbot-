#!/usr/bin/env node
// Ingest character data into Pinecone
// Usage: PINECONE_API_KEY=... PINECONE_INDEX=... GOOGLE_API_KEY=... node scripts/ingest.js

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'friends-chatbot';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!PINECONE_API_KEY || !GOOGLE_API_KEY) {
  console.error('Set PINECONE_API_KEY and GOOGLE_API_KEY environment variables');
  process.exit(1);
}

// --- Chunking ---
// Split text into chunks of roughly 300-800 tokens (~4 chars per token)
const CHUNK_TARGET_CHARS = 1600; // ~400 tokens
const CHUNK_MAX_CHARS = 3200;    // ~800 tokens
const CHUNK_OVERLAP_CHARS = 200; // ~50 tokens overlap

function chunkText(heading, text) {
  const chunks = [];
  // If the section is short enough, keep it as one chunk
  if (text.length <= CHUNK_MAX_CHARS) {
    chunks.push({ heading, text });
    return chunks;
  }

  // Split into sentences for better chunk boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > CHUNK_TARGET_CHARS && current.length > 0) {
      chunks.push({ heading, text: current.trim() });
      // Keep overlap from end of previous chunk
      const words = current.split(' ');
      const overlapWords = words.slice(-Math.floor(CHUNK_OVERLAP_CHARS / 5));
      current = overlapWords.join(' ') + ' ' + sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) {
    chunks.push({ heading, text: current.trim() });
  }
  return chunks;
}

// --- Embedding via Google gemini-embedding-001 ---
async function embedTexts(texts) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GOOGLE_API_KEY}`;

  const requests = texts.map(text => ({
    model: 'models/gemini-embedding-001',
    content: { parts: [{ text }] },
    taskType: 'RETRIEVAL_DOCUMENT',
    outputDimensionality: 768,
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      // Rate limited — wait and retry
      console.log('    Rate limited, waiting 20s...');
      await new Promise(r => setTimeout(r, 20000));
      return embedTexts(texts); // retry
    }
    const err = await res.text();
    throw new Error(`Embedding API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.embeddings.map(e => e.values);
}

// --- Pinecone helpers ---
async function getPineconeHost() {
  const res = await fetch(
    `https://api.pinecone.io/indexes/${PINECONE_INDEX}`,
    { headers: { 'Api-Key': PINECONE_API_KEY } }
  );
  if (!res.ok) throw new Error(`Pinecone index lookup failed: ${res.status}`);
  const data = await res.json();
  return data.host; // e.g. "friends-chatbot-xxx.svc.xxx.pinecone.io"
}

async function upsertVectors(host, namespace, vectors) {
  const res = await fetch(`https://${host}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vectors, namespace }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone upsert error: ${res.status} ${err}`);
  }
  return res.json();
}

// --- Main ---
async function main() {
  const dataDir = join(__dirname, 'data');
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.error('No JSON files found in scripts/data/. Run scrape-wiki.js first.');
    process.exit(1);
  }

  console.log('Looking up Pinecone index host...');
  const host = await getPineconeHost();
  console.log(`  Host: ${host}`);

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
    const character = data.character;
    console.log(`\nProcessing ${character}...`);

    // Build chunks
    const allChunks = [];
    for (const section of data.sections) {
      const chunks = chunkText(section.heading, section.text);
      allChunks.push(...chunks);
    }
    console.log(`  ${allChunks.length} chunks`);

    // Embed in batches of 20 (API limit)
    const BATCH_SIZE = 20;
    let vectorId = 0;
    const vectors = [];

    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map(c => `${c.heading}: ${c.text}`);

      console.log(`  Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allChunks.length / BATCH_SIZE)}...`);
      const embeddings = await embedTexts(texts);

      for (let j = 0; j < batch.length; j++) {
        vectors.push({
          id: `${character}-${vectorId++}`,
          values: embeddings[j],
          metadata: {
            character,
            heading: batch[j].heading,
            text: batch[j].text,
          },
        });
      }

      // Delay between batches to respect 100 req/min rate limit
      if (i + BATCH_SIZE < allChunks.length) {
        await new Promise(r => setTimeout(r, 15000));
      }
    }

    // Upsert to Pinecone (one namespace per character)
    console.log(`  Upserting ${vectors.length} vectors to namespace "${character}"...`);
    const UPSERT_BATCH = 100;
    for (let i = 0; i < vectors.length; i += UPSERT_BATCH) {
      const batch = vectors.slice(i, i + UPSERT_BATCH);
      await upsertVectors(host, character, batch);
    }
    console.log(`  Done!`);
  }

  console.log('\nIngestion complete!');
}

main();
