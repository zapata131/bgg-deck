"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Game {
  objectid: string;
  name: { value: string } | string; // Handle both object and string (though schema says object/array, let's be safe)
  image?: string;
  yearpublished?: number;
  description?: string;
}

export default function CollectionPage() {
  const [username, setUsername] = useState("zapata131");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = async () => {
    setLoading(true);
    setError(null);
    setGames([]);
    try {
      const res = await fetch(`/api/bgg/collection?username=${username}`);
      if (!res.ok) throw new Error("Failed to fetch collection");
      const data = await res.json();

      // Normalize games data
      const items = data.items?.item || [];
      // Ensure items is an array
      const gamesList = Array.isArray(items) ? items : [items];

      setGames(gamesList);

      // Lazy fetch descriptions
      gamesList.forEach((game: any) => fetchDescription(game.objectid));

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
              g.objectid === id ? { ...g, description: data.description } : g
            )
          );
        }
      }
    } catch (err) {
      console.error(`Failed to fetch description for ${id}`, err);
    }
  };

  const getGameName = (game: any) => {
    if (typeof game.name === 'object' && game.name !== null && 'value' in game.name) {
      return game.name.value;
    }
    return "Unknown Title";
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">BGG Collection Test</h1>

      <div className="flex gap-2 mb-6">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="BGG Username"
          className="max-w-xs"
        />
        <Button onClick={fetchCollection} disabled={loading}>
          {loading ? "Loading..." : "Fetch Collection"}
        </Button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Card key={game.objectid} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg truncate" title={getGameName(game)}>
                {getGameName(game)}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {game.yearpublished}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {game.image && (
                <img
                  src={game.image}
                  alt={getGameName(game)}
                  className="w-full h-48 object-contain bg-muted rounded-md"
                />
              )}
              <div className="text-sm">
                {game.description ? (
                  <p className="line-clamp-4">{game.description}</p>
                ) : (
                  <span className="text-muted-foreground italic">Loading description...</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
