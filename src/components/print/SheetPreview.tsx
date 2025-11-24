import React from "react";
import { GameData, CardFront } from "@/components/card/CardFront";
import { CropMarks } from "./CropMarks";

interface SheetPreviewProps {
  cards: GameData[];
}

export function SheetPreview({ cards }: SheetPreviewProps) {
  // A4 Dimensions in mm
  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;

  // Card Dimensions in mm
  const CARD_WIDTH = 63.5;
  const CARD_HEIGHT = 88.9;

  // Grid Layout
  // We want to center the 3x3 grid on the page
  // 3 * 63.5 = 190.5mm width
  // 3 * 88.9 = 266.7mm height

  // Margins
  // (210 - 190.5) / 2 = 9.75mm horizontal margin
  // (297 - 266.7) / 2 = 15.15mm vertical margin

  return (
    <div
      className="bg-white shadow-2xl mx-auto relative overflow-hidden print:shadow-none print:overflow-visible"
      style={{
        width: `${PAGE_WIDTH}mm`,
        height: `${PAGE_HEIGHT}mm`,
        paddingTop: "15.15mm", // Centered vertically
        paddingLeft: "9.75mm", // Centered horizontally
      }}
    >
      <div
        className="grid grid-cols-3 gap-0"
        style={{
          width: "190.5mm",
        }}
      >
        {cards.map((game, index) => (
          <div key={`${game.id}-${index}`} className="relative">
            <CropMarks width={CARD_WIDTH} height={CARD_HEIGHT} />
            <CardFront
              game={game}
              className="rounded-none border-none" // Remove rounded corners for print if desired, or keep them inside bleed
            />
          </div>
        ))}
      </div>

      {/* Page Info / Metadata */}
      <div className="absolute bottom-2 left-0 right-0 text-center text-[8px] text-gray-400">
        La Matatena - BGG Deck Generator
      </div>
    </div>
  );
}
