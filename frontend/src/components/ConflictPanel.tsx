import { useConflicts } from "../store/useScheduleStore";
import { AlertCircle } from "lucide-react";

export function ConflictPanel() {
  const conflicts = useConflicts();

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5 overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        <ul className="space-y-1">
          {conflicts.map((conflict) => (
            <li key={conflict.id} className="text-[12px] text-portal-danger bg-white p-[8px] rounded-none border border-portal-danger shadow-none leading-tight flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-portal-danger mt-0 flex-none" />
              <span>{conflict.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
