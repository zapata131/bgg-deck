"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SheetPreview } from "@/components/print/SheetPreview";
import { GameData } from "@/components/card/CardFront";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function PrintPageContent() {
  const { t } = useI18n();
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
          const val = (obj: { value: string | number } | undefined) => obj?.value;

          let name = "Unknown";
          if (Array.isArray(item.name)) {
            const primary = (item.name as { type: string; value: string }[]).find((n) => n.type === "primary");
            name = primary ? primary.value : (item.name as { value: string }[])[0].value;
          } else {
            name = (item.name as { value: string }).value;
          }

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

    fetchGames();
  }, [ids]);

  const handleDownloadPdf = () => {
    if (!ids) return;
    window.location.href = `/api/print/pdf?ids=${ids}`;
  };

  if (loading) return <div className="p-10 text-center">{t("print.loading")}</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (games.length === 0) return <div className="p-10 text-center">{t("print.no_selection")}</div>;

  // Pagination: Split into chunks of 9
  const chunks = [];
  for (let i = 0; i < games.length; i += 9) {
    chunks.push(games.slice(i, i + 9));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      <div className="mb-8 flex justify-between items-center max-w-[210mm] mx-auto print:hidden">
        <h1 className="text-2xl font-bold">{t("print.title")}</h1>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPdf} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t("print.download_pdf")}
          </Button>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            {t("print.print")}
          </Button>
        </div>
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
