"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardFront, GameData } from "@/components/card/CardFront";
import { CardBack } from "@/components/card/CardBack";

export default function CollectionPage() {
  const [username, setUsername] = useState("zapata131");
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = async () => {
    setLoading(true);
    setError(null);
    setGames([]);
    try {
      // 1. Fetch Collection to get IDs
      const res = await fetch(`/api/bgg/collection?username=${username}`);
      if (!res.ok) throw new Error("Failed to fetch collection");
      const data = await res.json();

      const items = data.items?.item || [];
      const collectionList = Array.isArray(items) ? items : [items];

      if (collectionList.length === 0) {
        setError("No games found.");
        setLoading(false);
        return;
      }

      // 2. Extract IDs (limit to 5 for now to avoid massive requests)
      const ids = collectionList.slice(0, 5).map((item: any) => item.objectid).join(",");

      // 3. Fetch Thing Details
      const thingsRes = await fetch(`/api/bgg/thing?id=${ids}`);
      if (!thingsRes.ok) {
        const errData = await thingsRes.json();
        throw new Error(errData.details || "Failed to fetch game details");
      }
      const thingsData = await thingsRes.json();

      const thingsItems = thingsData.items?.item || [];
      const thingsList = Array.isArray(thingsItems) ? thingsItems : [thingsItems];

      // 4. Map to GameData
      const mappedGames: GameData[] = thingsList.map((item: any) => {
        // Helper to get value from { value: ... } objects
        const val = (obj: any) => obj?.value;
        const listVal = (arr: any) => {
          if (!arr) return [];
          const list = Array.isArray(arr) ? arr : [arr];
          return list.map((i: any) => i.value);
        };

        // Extract Name (primary)
        let name = "Unknown";
        if (Array.isArray(item.name)) {
          const primary = item.name.find((n: any) => n.type === "primary");
          name = primary ? primary.value : item.name[0].value;
        } else {
          name = item.name.value;
        }

        // Extract Credits
        const links = Array.isArray(item.link) ? item.link : [item.link];
        const designers = links.filter((l: any) => l.type === "boardgamedesigner").map((l: any) => l.value);
        const artists = links.filter((l: any) => l.type === "boardgameartist").map((l: any) => l.value);

        return {
          id: item.id,
          name: name,
          image: item.image,
          yearpublished: val(item.yearpublished),
          minplayers: val(item.minplayers),
          maxplayers: val(item.maxplayers),
          playingtime: val(item.playingtime),
          averageweight: item.statistics?.ratings?.averageweight?.value,
          designers: designers.slice(0, 2), // Limit to 2
          artists: artists.slice(0, 2),
        };
      });

      setGames(mappedGames);

      // 5. Fetch Descriptions (Lazy)
      mappedGames.forEach((game) => fetchDescription(game.id));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDescription = async (id: string) => {
    try {
      const res = await fetch(`/api/bgg/description?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.description) {
          setGames((prev) =>
            prev.map((g) =>
              g.id === id ? { ...g, description: data.description } : g
            )
          );
        }
      }
    } catch (err) {
      console.error(`Failed to fetch description for ${id}`, err);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-muted/20 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-primary">My Collection</h1>

      <div className="flex gap-4 mb-8">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="BGG Username"
          className="max-w-xs bg-white"
        />
        <Button onClick={fetchCollection} disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
          {loading ? "Loading..." : "Fetch Collection"}
        </Button>
      </div>

      {error && <div className="text-destructive mb-4 font-medium">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {games.map((game) => (
          <div key={game.id} className="flex flex-col gap-4 items-center">
            {/* Card Front */}
            <div className="relative group perspective-1000">
              <CardFront game={game} className="shadow-xl transition-transform hover:scale-105 duration-300" />
            </div>
            {/* Card Back Preview (Optional, maybe on flip or separate) */}
            {/* <CardBack /> */}
          </div>
        ))}
      </div>
    </div>
  );
}
