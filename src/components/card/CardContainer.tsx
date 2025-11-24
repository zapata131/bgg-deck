import { cn } from "@/lib/utils";
import React from "react";

interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  bleed?: boolean;
}

export function CardContainer({ children, className, bleed = false, ...props }: CardContainerProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden shadow-md bg-card text-card-foreground",
        // Aspect ratio for Poker Card (63.5mm / 88.9mm)
        // If bleed is true, we don't enforce aspect-ratio via utility, but via explicit size in parent or style
        !bleed && "rounded-[3mm] aspect-[63.5/88.9] w-64",
        bleed && "w-full h-full", // Fill the bleed container
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
