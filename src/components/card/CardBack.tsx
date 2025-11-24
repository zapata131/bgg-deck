import { CardContainer } from "./CardContainer";
import { Dices } from "lucide-react";

export function CardBack() {
  return (
    <CardContainer className="bg-primary flex items-center justify-center">
      <div className="p-8 rounded-full bg-white/10">
        <Dices className="w-16 h-16 text-white" />
      </div>
      <div className="absolute bottom-4 text-white/50 text-xs font-bold tracking-widest uppercase">
        La Matatena
      </div>
    </CardContainer>
  );
}
