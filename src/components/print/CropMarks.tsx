import React from "react";

interface CropMarksProps {
  width: number; // in mm
  height: number; // in mm
  bleed?: number; // in mm
  length?: number; // length of the mark in mm
  offset?: number; // distance from trim line in mm
  color?: string;
}

export function CropMarks({
  width,
  height,
  bleed = 3,
  length = 5,
  offset = 3,
  color = "#000000",
}: CropMarksProps) {
  // SVG viewbox needs to cover the card + bleed + marks
  // We'll position the SVG absolutely over the card container

  // Actually, it's easier to render 4 corner marks as absolute divs or a single SVG overlay
  // Let's use a single SVG overlay that is slightly larger than the card

  const totalWidth = width + (bleed + length + offset) * 2;
  const totalHeight = height + (bleed + length + offset) * 2;

  // Helper to draw a corner mark
  // x, y are the coordinates of the TRIM corner (0,0 is top-left of card)
  // We need to translate these to SVG coordinates

  const originX = bleed + length + offset;
  const originY = bleed + length + offset;

  const path = [
    // Top Left
    `M ${originX - offset - length} ${originY} H ${originX - offset}`, // Horizontal
    `M ${originX} ${originY - offset - length} V ${originY - offset}`, // Vertical

    // Top Right
    `M ${originX + width + offset} ${originY} H ${originX + width + offset + length}`,
    `M ${originX + width} ${originY - offset - length} V ${originY - offset}`,

    // Bottom Right
    `M ${originX + width + offset} ${originY + height} H ${originX + width + offset + length}`,
    `M ${originX + width} ${originY + height + offset} V ${originY + height + offset + length}`,

    // Bottom Left
    `M ${originX - offset - length} ${originY + height} H ${originX - offset}`,
    `M ${originX} ${originY + height + offset} V ${originY + height + offset + length}`,
  ].join(" ");

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        top: `-${bleed + length + offset}mm`,
        left: `-${bleed + length + offset}mm`,
        width: `${totalWidth}mm`,
        height: `${totalHeight}mm`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        style={{ overflow: "visible" }}
      >
        <path d={path} stroke={color} strokeWidth="0.25" fill="none" />
      </svg>
    </div>
  );
}
