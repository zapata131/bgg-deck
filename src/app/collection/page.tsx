"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardFront, GameData } from "@/components/card/CardFront";

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

      // 2. Extract IDs (limit to 50 for now)
      const ids = collectionList.slice(0, 50).map((item: { objectid: string }) => item.objectid).join(",");

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
      const mappedGames: GameData[] = thingsList.map((item: {
        id: string;
        name: { value: string } | { value: string }[];
        image: string;
        yearpublished: { value: string | number };
        minplayers: { value: string | number };
        maxplayers: { value: string | number };
        playingtime: { value: string | number };
        statistics?: { ratings?: { averageweight?: { value: number } } };
        link: { type: string; value: string } | { type: string; value: string }[];
      }) => {
        // Helper to get value from { value: ... } objects
        const val = (obj: { value: string | number } | undefined) => obj?.value;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const listVal = (arr: { value: string } | { value: string }[] | undefined) => {
          if (!arr) return [];
          const list = Array.isArray(arr) ? arr : [arr];
          return list.map((i: { value: string }) => i.value);
        };

        // Extract Name (primary)
        let name = "Unknown";
        if (Array.isArray(item.name)) {
          const primary = (item.name as { type: string; value: string }[]).find((n) => n.type === "primary");
          name = primary ? primary.value : (item.name as { value: string }[])[0].value;
        } else {
          name = (item.name as { value: string }).value;
        }

        // Extract Credits
        const links = Array.isArray(item.link) ? item.link : [item.link];
        const designers = links.filter((l: { type: string; value: string }) => l.type === "boardgamedesigner").map((l: { value: string }) => l.value);
        const artists = links.filter((l: { type: string; value: string }) => l.type === "boardgameartist").map((l: { value: string }) => l.value);

        return {
          id: item.id,
          name: name,
          image: item.image,
          yearpublished: Number(val(item.yearpublished)) || undefined,
          minplayers: Number(val(item.minplayers)) || undefined,
          maxplayers: Number(val(item.maxplayers)) || undefined,
          playingtime: Number(val(item.playingtime)) || undefined,
          averageweight: Number(item.statistics?.ratings?.averageweight?.value) || undefined,
          designers: designers.slice(0, 2), // Limit to 2
          artists: artists.slice(0, 2),
        };
      });

      setGames(mappedGames);

      // 5. Fetch Descriptions (Lazy)
      mappedGames.forEach((game) => fetchDescription(game.id));

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
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

  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedGames);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedGames(newSelection);
  };

  const handlePrint = () => {
    if (selectedGames.size === 0) return;
    const ids = Array.from(selectedGames).join(",");
    window.open(`/print?ids=${ids}`, "_blank");
  };

  return (
    <div className="container mx-auto p-4 bg-muted/20 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">My Collection</h1>
        {selectedGames.size > 0 && (
          <Button onClick={handlePrint} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Print Selected ({selectedGames.size})
          </Button>
        )}
      </div>

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
          <div key={game.id} className="flex flex-col gap-4 items-center relative">
            {/* Selection Checkbox */}
            <div className="absolute top-2 right-2 z-20">
              <input
                type="checkbox"
                checked={selectedGames.has(game.id)}
                onChange={() => toggleSelection(game.id)}
                className="w-6 h-6 accent-primary cursor-pointer shadow-md"
              />
            </div>

            {/* Card Front */}
            <div
              className={`relative group perspective-1000 cursor-pointer ${selectedGames.has(game.id) ? 'ring-4 ring-primary rounded-[3mm]' : ''}`}
              onClick={() => toggleSelection(game.id)}
            >
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
