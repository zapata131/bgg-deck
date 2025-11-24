"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SheetPreview } from "@/components/print/SheetPreview";
import { GameData } from "@/components/card/CardFront";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

function PrintPageContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids");
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ids) {
      setLoading(false);
      return;
    }

    const fetchGames = async () => {
      try {
        // 1. Fetch Thing Details
        const thingsRes = await fetch(`/api/bgg/thing?id=${ids}`);
        if (!thingsRes.ok) throw new Error("Failed to fetch game details");
        const thingsData = await thingsRes.json();

        const thingsItems = thingsData.items?.item || [];
        const thingsList = Array.isArray(thingsItems) ? thingsItems : [thingsItems];

        // 2. Map to GameData (Reuse logic from CollectionPage - ideally refactor to util)
        const mappedGames: GameData[] = thingsList.map((item: any) => {
          const val = (obj: any) => obj?.value;

          let name = "Unknown";
          if (Array.isArray(item.name)) {
            const primary = item.name.find((n: any) => n.type === "primary");
            name = primary ? primary.value : item.name[0].value;
          } else {
            name = item.name.value;
          }

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
            designers: designers.slice(0, 2),
            artists: artists.slice(0, 2),
          };
        });

        setGames(mappedGames);

        // 3. Fetch Descriptions
        mappedGames.forEach(async (game) => {
          try {
            const res = await fetch(`/api/bgg/description?id=${game.id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.description) {
                setGames(prev => prev.map(g => g.id === game.id ? { ...g, description: data.description } : g));
              }
            }
          } catch (e) {
            console.error(e);
          }
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [ids]);

  if (loading) return <div className="p-10 text-center">Loading print preview...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (games.length === 0) return <div className="p-10 text-center">No games selected.</div>;

  // Pagination: Split into chunks of 9
  const chunks = [];
  for (let i = 0; i < games.length; i += 9) {
    chunks.push(games.slice(i, i + 9));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      <div className="mb-8 flex justify-between items-center max-w-[210mm] mx-auto print:hidden">
        <h1 className="text-2xl font-bold">Print Preview</h1>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      <div className="flex flex-col gap-8 print:block">
        {chunks.map((chunk, i) => (
          <div key={i} className="print:break-after-page">
            <SheetPreview cards={chunk} />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintPageContent />
    </Suspense>
  );
}
