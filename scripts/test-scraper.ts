import { fetchShortDescription } from "../src/lib/scraper";

async function main() {
  const gameId = "13"; // Catan

  console.log("--- First Request (Cache Miss) ---");
  const start1 = performance.now();
  const desc1 = await fetchShortDescription(gameId);
  const end1 = performance.now();
  console.log(`Description length: ${desc1?.length}`);
  console.log(`Time: ${(end1 - start1).toFixed(2)}ms`);
  console.log(`Snippet: ${desc1?.slice(0, 100)}...`);

  console.log("\n--- Second Request (Cache Hit) ---");
  const start2 = performance.now();
  const desc2 = await fetchShortDescription(gameId);
  const end2 = performance.now();
  console.log(`Description length: ${desc2?.length}`);
  console.log(`Time: ${(end2 - start2).toFixed(2)}ms`);

  if ((end2 - start2) < 10) {
    console.log("✅ Cache appears to be working (response < 10ms)");
  } else {
    console.log("⚠️ Cache might not be working (response > 10ms)");
  }
}

main();
