import { useScheduleStore } from "../store/useScheduleStore";
import { Button } from "./ui/button";
import { MousePointerSquareDashed } from "lucide-react";

export function BlockTool() {
  const isBlockingMode = useScheduleStore((s) => s.isBlockingMode);
  const setIsBlockingMode = useScheduleStore((s) => s.setIsBlockingMode);

  return (
    <div className="flex flex-col gap-3 flex-shrink-0">
      <Button 
        variant={isBlockingMode ? "portalDanger" : "portalSecondary"}
        className="w-full flex items-center gap-2"
        onClick={() => setIsBlockingMode(!isBlockingMode)}
      >
        <MousePointerSquareDashed className="h-4 w-4" />
        {isBlockingMode ? "Blocking unwanted time: ON" : "Enable Blocking unwanted time"}
      </Button>
    </div>
  );
}
