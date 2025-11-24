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

  // Bleed & Gutters
  const BLEED = 2; // 2mm bleed per side
  // const GUTTER = BLEED * 2; // 4mm spacing between cards (Unused)

  // Total size of a "cell" in the grid (Trim + Bleed)
  // Actually, we want the grid gap to handle the bleed area?
  // No, standard imposition:
  // Cards are placed with spacing. The spacing is where the cut happens.
  // If we want bleed, the image must extend INTO the spacing.
  // So, we render the card LARGER (Trim + 2*Bleed) and overlap them?
  // Or just place them with 0 gap if they share a cut?
  // User asked for bleed so they "don't have to cut exactly".
  // This implies spacing between cards.

  // Let's use a grid gap of 4mm.
  // Each cell contains a card + bleed.
  // Card Size (Trim) = 63.5 x 88.9
  // Card Size (Bleed) = 67.5 x 92.9

  // Grid:
  // Col 1 | Gap | Col 2 | Gap | Col 3
  // 67.5  |  0  | 67.5  |  0  | 67.5  (If we include bleed in the cell size)

  const CELL_WIDTH = CARD_WIDTH + (BLEED * 2);
  const CELL_HEIGHT = CARD_HEIGHT + (BLEED * 2);

  // Total Grid Width = 3 * 67.5 = 202.5mm
  // 210 - 202.5 = 7.5mm margin (3.75mm per side) - Tight fit but fits!

  return (
    <div
      className="bg-white shadow-2xl mx-auto relative overflow-hidden print:shadow-none print:overflow-visible"
      style={{
        width: `${PAGE_WIDTH}mm`,
        height: `${PAGE_HEIGHT}mm`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="grid grid-cols-3"
        style={{
          width: `${CELL_WIDTH * 3}mm`,
        }}
      >
        {cards.map((game, index) => (
          <div
            key={`${game.id}-${index}`}
            className="relative"
            style={{
              width: `${CELL_WIDTH}mm`,
              height: `${CELL_HEIGHT}mm`,
              padding: `${BLEED}mm`, // Padding acts as the bleed area container
            }}
          >
            {/* Crop Marks are positioned relative to the TRIM box */}
            {/* Since we have padding = bleed, the content box IS the trim box? No. */}
            {/* We want the CardContainer to fill the WHOLE cell (Trim + Bleed) */}

            <div className="w-full h-full relative">
              <CropMarks
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                bleed={BLEED}
                offset={2} // Start marks 2mm away from bleed edge (4mm from trim)
              />
              <CardFront
                game={game}
                bleed={true}
                className="rounded-none border-none"
              />
            </div>
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
