import * as cheerio from "cheerio";
import { LRUCache } from "lru-cache";

// Cache configuration: 500 items, 90 days TTL
const cache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24 * 90, // 90 days
});

const HEADERS = {
  "User-Agent": "LaMatatena/1.0 (zapata131@gmail.com)",
};

export async function fetchShortDescription(gameId: string): Promise<string | null> {
  // 1. Check Cache
  if (cache.has(gameId)) {
    console.log(`[Scraper] Cache HIT for ${gameId}`);
    return cache.get(gameId) || null;
  }

  console.log(`[Scraper] Cache MISS for ${gameId}. Fetching...`);

  try {
    // 2. Fetch BGG Page
    const url = `https://boardgamegeek.com/boardgame/${gameId}`;
    const res = await fetch(url, { headers: HEADERS });

    if (!res.ok) {
      console.error(`[Scraper] Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      return null;
    }

    const html = await res.text();

    // 3. Parse HTML
    const $ = cheerio.load(html);

    // 4. Extract Description
    // Try standard meta description first, then og:description
    let description = $('meta[name="description"]').attr("content");
    if (!description) {
      description = $('meta[property="og:description"]').attr("content");
    }

    if (description) {
      // Clean up the description (decode HTML entities if needed, though cheerio handles most)
      description = description.trim();

      // 5. Store in Cache
      cache.set(gameId, description);
      return description;
    } else {
      console.warn(`[Scraper] No description found for ${gameId}`);
      return null;
    }
  } catch (error) {
    console.error(`[Scraper] Error fetching ${gameId}:`, error);
    return null;
  }
}
