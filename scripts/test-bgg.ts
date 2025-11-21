import { fetchBggCollection, fetchBggThing } from "../src/lib/bgg";
import dotenv from "dotenv";
import * as path from "path";

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

console.log("BGG_API_TOKEN present:", !!process.env.BGG_API_TOKEN);

async function main() {
  console.log("Testing fetchBggCollection with token...");
  try {
    const collection = await fetchBggCollection("zapata131");
    console.log("Collection success:", JSON.stringify(collection, null, 2).slice(0, 200));
  } catch (error) {
    console.error("Collection failed:", error);
  }

  console.log("\nTesting fetchBggThing with token...");
  try {
    const thing = await fetchBggThing(["13"]); // Catan
    console.log("Thing success:", JSON.stringify(thing, null, 2).slice(0, 200));
  } catch (error) {
    console.error("Thing failed:", error);
  }
}

main();
