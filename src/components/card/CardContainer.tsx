import { cn } from "@/lib/utils";
import React from "react";

interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContainer({ children, className, ...props }: CardContainerProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[3mm] shadow-md bg-card text-card-foreground",
        // Aspect ratio for Poker Card (63.5mm / 88.9mm)
        "aspect-[63.5/88.9]",
        // Default width for screen preview (can be overridden)
        "w-64",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
