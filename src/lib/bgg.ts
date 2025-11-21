import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const BGG_API_BASE = "https://boardgamegeek.com/xmlapi2";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "value",
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    // Always treat these as arrays
    const arrayFields = ["item", "link", "name", "poll", "result"];
    if (name === "name" && isAttribute) return false;
    return arrayFields.includes(name);
  },
});

// --- Zod Schemas ---

export const BggCollectionItemSchema = z.object({
  objectid: z.string(),
  name: z.object({
    value: z.string(),
  }).or(z.array(z.object({
    value: z.string(),
  })).transform(arr => arr[0])),
  yearpublished: z.coerce.number().optional(),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  stats: z.object({
    minplayers: z.coerce.number(),
    maxplayers: z.coerce.number(),
    minplaytime: z.coerce.number(),
    maxplaytime: z.coerce.number(),
    playingtime: z.coerce.number(),
    numowned: z.coerce.number(),
  }).optional(),
  status: z.object({
    own: z.coerce.number(),
    prevowned: z.coerce.number(),
    fortrade: z.coerce.number(),
    want: z.coerce.number(),
    wanttoplay: z.coerce.number(),
    wanttobuy: z.coerce.number(),
    wishlist: z.coerce.number(),
    preordered: z.coerce.number(),
    lastmodified: z.string(),
  }),
});

export const BggCollectionSchema = z.object({
  items: z.object({
    item: z.array(BggCollectionItemSchema).optional(),
    totalitems: z.coerce.number(),
  }),
});

export const BggThingSchema = z.object({
  id: z.string(),
  type: z.string(),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  name: z.array(
    z.object({
      type: z.string(),
      sortindex: z.string(),
      value: z.string(),
    })
  ),
  description: z.string(),
  yearpublished: z.object({ value: z.coerce.number() }).optional(),
  minplayers: z.object({ value: z.coerce.number() }),
  maxplayers: z.object({ value: z.coerce.number() }),
  playingtime: z.object({ value: z.coerce.number() }),
  minplaytime: z.object({ value: z.coerce.number() }),
  maxplaytime: z.object({ value: z.coerce.number() }),
  minage: z.object({ value: z.coerce.number() }),
  link: z.array(
    z.object({
      type: z.string(),
      id: z.string(),
      value: z.string(),
    })
  ),
  statistics: z.object({
    ratings: z.object({
      averageweight: z.object({ value: z.coerce.number() }),
      average: z.object({ value: z.coerce.number() }),
      bayesaverage: z.object({ value: z.coerce.number() }),
      ranks: z.object({
        rank: z.array(
          z.object({
            type: z.string(),
            id: z.string(),
            name: z.string(),
            friendlyname: z.string(),
            value: z.string(), // can be "Not Ranked"
            bayesaverage: z.string(),
          })
        ),
      }),
      usersrated: z.object({ value: z.coerce.number() }),
    }),
  }),
});

export const BggThingResponseSchema = z.object({
  items: z.object({
    item: z.array(BggThingSchema),
  }),
});

// --- Types ---

export type BggCollectionItem = z.infer<typeof BggCollectionItemSchema>;
export type BggThing = z.infer<typeof BggThingSchema>;

// --- Helper Functions ---

function getHeaders() {
  return {
    "User-Agent": "LaMatatena/1.0 (zapata131@gmail.com)",
    ...(process.env.BGG_API_TOKEN ? { Authorization: `Bearer ${process.env.BGG_API_TOKEN}` } : {}),
  };
}

export async function fetchBggCollection(username: string) {
  const url = `${BGG_API_BASE}/collection?username=${username}&own=1&excludesubtype=boardgameexpansion`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`Failed to fetch collection: ${res.statusText}`);
  }
  const xml = await res.text();
  const json = parser.parse(xml);

  // Handle 202 Accepted (processing)
  if (res.status === 202 || (json.message && json.message.includes("queued"))) {
    return { status: 202, message: "Your request has been queued. Please try again later." };
  }

  // Normalize empty collection
  if (!json.items.item) {
    json.items.item = [];
  }

  return BggCollectionSchema.parse(json);
}

export async function fetchBggThing(ids: string[]) {
  const idString = ids.join(",");
  const url = `${BGG_API_BASE}/thing?id=${idString}&stats=1`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`Failed to fetch things: ${res.statusText}`);
  }
  const xml = await res.text();
  const json = parser.parse(xml);

  return BggThingResponseSchema.parse(json);
}
