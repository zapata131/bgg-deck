import { CardContainer } from "./CardContainer";
import { Users, Clock, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GameData {
  id: string;
  name: string;
  image?: string;
  yearpublished?: number;
  minplayers?: number;
  maxplayers?: number;
  playingtime?: number;
  averageweight?: number;
  description?: string;
  designers?: string[];
  artists?: string[];
}

interface CardFrontProps {
  game: GameData;
  className?: string;
  bleed?: boolean;
}

export function CardFront({ game, className, bleed = false }: CardFrontProps) {
  return (
    <CardContainer className={cn("bg-white", className)} bleed={bleed}>
      {/* Top Half: Image */}
      <div className="h-[55%] w-full relative bg-muted overflow-hidden">
        {game.image ? (
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Overlay Gradient for Text Readability */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Title & Year */}
        <div className="absolute bottom-2 left-3 right-3 text-white">
          <h2 className="font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
            {game.name}
          </h2>
          {game.yearpublished && (
            <p className="text-xs opacity-90 font-medium drop-shadow-sm">
              {game.yearpublished}
            </p>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="h-[12%] bg-primary text-white flex items-center justify-between px-4 text-xs font-bold shadow-sm z-10">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 opacity-80" />
          <span>
            {game.minplayers === game.maxplayers
              ? game.minplayers
              : `${game.minplayers}-${game.maxplayers}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 opacity-80" />
          <span>{game.playingtime}m</span>
        </div>
        <div className="flex items-center gap-1">
          <Dumbbell className="w-3.5 h-3.5 opacity-80" />
          <span>{game.averageweight?.toFixed(1) || "-"}</span>
        </div>
      </div>

      {/* Bottom Half: Description & Credits */}
      <div className="flex-1 p-3 flex flex-col gap-2 bg-[#F5F0E9] text-[#3A3A3A]">
        <p className="text-[10px] leading-snug line-clamp-6 flex-1 opacity-90 text-justify">
          {game.description || "No description available."}
        </p>

        <div className="mt-auto pt-2 border-t border-black/10 flex flex-col gap-0.5 text-[9px] opacity-70">
          {game.designers && game.designers.length > 0 && (
            <div className="flex gap-1 truncate">
              <span className="font-bold">Design:</span>
              <span className="truncate">{game.designers.join(", ")}</span>
            </div>
          )}
          {game.artists && game.artists.length > 0 && (
            <div className="flex gap-1 truncate">
              <span className="font-bold">Art:</span>
              <span className="truncate">{game.artists.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </CardContainer>
  );
}
