#!/usr/bin/env node
// Scrape Friends Fandom wiki pages for character data
// Usage: node scripts/scrape-wiki.js

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CHARACTERS = {
  rachel: 'https://friends.fandom.com/wiki/Rachel_Greene',
  ross: 'https://friends.fandom.com/wiki/Ross_Geller',
  monica: 'https://friends.fandom.com/wiki/Monica_Geller',
  chandler: 'https://friends.fandom.com/wiki/Chandler_Bing',
  joey: 'https://friends.fandom.com/wiki/Joey_Tribbiani',
  phoebe: 'https://friends.fandom.com/wiki/Phoebe_Buffay',
};

// Headings to skip (navigation, meta sections)
const SKIP_HEADINGS = new Set([
  'contents', 'navigation', 'references', 'external links',
  'see also', 'gallery', 'categories', 'behind the scenes',
  'notes', 'trivia notes',
]);

async function scrapeCharacter(name, url) {
  console.log(`Scraping ${name} from ${url}...`);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'FriendsBot/1.0 (educational project)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const html = await res.text();

  // We'll parse the wiki content using regex-based extraction
  // since we can't use cheerio in a simple script without installing it first.
  // Extract the main content div
  const sections = [];

  // Match content between heading tags
  // Wiki pages use <h2><span class="mw-headline" id="...">Heading</span></h2>
  // followed by content until the next heading
  const headingRegex = /<h([23])[^>]*>.*?<span[^>]*class="mw-headline"[^>]*>([^<]+)<\/span>.*?<\/h\1>/gi;
  const matches = [...html.matchAll(headingRegex)];

  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][2].trim();
    const headingLower = heading.toLowerCase();

    if (SKIP_HEADINGS.has(headingLower)) continue;

    // Get content between this heading and the next
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : html.length;
    const rawContent = html.slice(startIdx, endIdx);

    // Strip HTML tags and clean up
    let text = rawContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\[\d+\]/g, '') // remove citation markers [1], [2], etc.
      .replace(/\s+/g, ' ')
      .trim();

    // Only include sections with meaningful content
    if (text.length > 50) {
      sections.push({ heading, text });
    }
  }

  return { character: name, sections };
}

async function main() {
  const dataDir = join(__dirname, 'data');
  mkdirSync(dataDir, { recursive: true });

  for (const [key, url] of Object.entries(CHARACTERS)) {
    try {
      const data = await scrapeCharacter(key, url);
      const outPath = join(dataDir, `${key}.json`);
      writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`  -> ${data.sections.length} sections saved to ${outPath}`);
    } catch (err) {
      console.error(`  ERROR scraping ${key}:`, err.message);
    }
  }

  console.log('\nDone! Review JSON files in scripts/data/');
}

main();
