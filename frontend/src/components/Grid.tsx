import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useScheduleStore, useScheduledMeetings, useConflicts } from "../store/useScheduleStore";
import { DayOfWeek, ScheduledMeeting, BlockedTime } from "../lib/types";
import { timeToMinutes, minutesToTime, getBestSection, START_HOUR, END_HOUR, MIN_PER_CELL } from "../lib/schedule";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const DAYS: DayOfWeek[] = ["M", "T", "W", "Th", "F"];

export function Grid({ 
  activeDragCourseId, 
  activeDragType,
  hoveredDay,
  hoveredTime
}: { 
  activeDragCourseId?: string | null;
  activeDragType?: "LEC" | "LAB" | null;
  hoveredDay?: DayOfWeek | null;
  hoveredTime?: number | null;
}) {
  const activeSemesterId = useScheduleStore((s) => s.activeSemesterId);
  const selectedCourses = useScheduleStore((s) => s.selectedCourses);
  const meetings = useScheduledMeetings();
  const conflicts = useConflicts();
  const blockedTimes = useScheduleStore((s) => s.blockedTimeBySemesterId[activeSemesterId]) || [];
  const addBlockedTime = useScheduleStore((s) => s.addBlockedTime);
  const removeBlockedTime = useScheduleStore((s) => s.removeBlockedTime);
  const isBlockingMode = useScheduleStore((s) => s.isBlockingMode);

  const [dragBlockStart, setDragBlockStart] = useState<{day: DayOfWeek, index: number} | null>(null);
  const [dragBlockCurrent, setDragBlockCurrent] = useState<{day: DayOfWeek, index: number} | null>(null);

  const handleMouseUp = () => {
    if (isBlockingMode && dragBlockStart && dragBlockCurrent) {
      const startDayIdx = DAYS.indexOf(dragBlockStart.day);
      const currentDayIdx = DAYS.indexOf(dragBlockCurrent.day);
      const minDayIdx = Math.min(startDayIdx, currentDayIdx);
      const maxDayIdx = Math.max(startDayIdx, currentDayIdx);

      const minIdx = Math.min(dragBlockStart.index, dragBlockCurrent.index);
      const maxIdx = Math.max(dragBlockStart.index, dragBlockCurrent.index);
      
      const startTime = minutesToTime(START_HOUR * 60 + minIdx * MIN_PER_CELL);
      const endTime = minutesToTime(START_HOUR * 60 + (maxIdx + 1) * MIN_PER_CELL);
      
      for (let d = minDayIdx; d <= maxDayIdx; d++) {
        addBlockedTime(activeSemesterId, {
          id: uuidv4(),
          day: DAYS[d],
          startTime,
          endTime,
        });
      }
    }
    setDragBlockStart(null);
    setDragBlockCurrent(null);
  };

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  // Compute ghost meetings for the dragged course
  let ghostMeetings: (ScheduledMeeting & { isHighlighted: boolean })[] = [];
  const draggedCourse = activeDragCourseId ? selectedCourses.find(c => c.id === activeDragCourseId) : null;

  if (draggedCourse) {
    const targetType = activeDragType || "LEC";
    const isLecTarget = targetType === "LEC";
    const sections = draggedCourse.components.filter(s => isLecTarget ? s.type === "LEC" : s.type !== "LEC");
    
    let bestSectionId: string | null = null;
    if (hoveredDay) {
      const otherMeetings = meetings.filter(m => m.courseId !== draggedCourse.id || (isLecTarget ? m.type !== "LEC" : m.type === "LEC"));
      const best = getBestSection(draggedCourse, targetType, hoveredDay, hoveredTime || null, otherMeetings, blockedTimes);
      if (best) bestSectionId = best.id;
    }

    sections.forEach(sec => {
      const isHighlighted = sec.id === bestSectionId;
      sec.meetings.forEach(m => {
        m.days.forEach(day => {
          ghostMeetings.push({
            id: `ghost-${sec.id}-${day}-${m.startTime}`,
            courseId: draggedCourse.id,
            componentId: sec.id,
            type: sec.type,
            section: sec.section,
            day: day,
            startTime: m.startTime,
            endTime: m.endTime,
            startMinutes: timeToMinutes(m.startTime),
            endMinutes: timeToMinutes(m.endTime),
            location: sec.location,
            instructor: sec.instructor,
            isHighlighted,
          });
        });
      });
    });
  }

  // Filter out the currently selected section of the dragged course to avoid overlap
  const displayMeetings = activeDragCourseId && activeDragType
    ? meetings.filter(m => !(m.courseId === activeDragCourseId && (activeDragType === "LEC" ? m.type === "LEC" : m.type !== "LEC")))
    : meetings;

  return (
    <div className="flex flex-col h-full bg-portal-surface border border-portal-border overflow-hidden rounded-none">
      <div className="flex bg-portal-toolbar border-b border-portal-border">
        <div className="w-16 flex-shrink-0 border-r border-portal-border"></div>
        {DAYS.map((day) => (
          <div key={day} className="flex-1 text-center py-2 text-[14px] font-bold text-portal-text border-r border-portal-border last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex flex-1 overflow-y-auto relative" onMouseLeave={handleMouseUp} onMouseUp={handleMouseUp}>
        <div className="w-16 flex-shrink-0 border-r border-portal-border bg-portal-toolbar relative">
          {hours.map((hour) => (
            <div key={hour} className="h-[48px] border-b border-portal-border text-[12px] text-portal-text-secondary text-right pr-2 pt-1">
              {`${hour.toString().padStart(2, "0")}:00`}
            </div>
          ))}
        </div>
        
        <div className="flex flex-1 relative bg-white">
          {DAYS.map((day) => (
            <DayColumn
              key={day}
              day={day}
              meetings={displayMeetings.filter((m) => m.day === day)}
              ghostMeetings={ghostMeetings.filter((m) => m.day === day)}
              blockedTimes={blockedTimes.filter((b) => b.day === day)}
              conflicts={conflicts}
              isBlockingMode={isBlockingMode}
              dragBlockStart={dragBlockStart}
              dragBlockCurrent={dragBlockCurrent}
              setDragBlockStart={setDragBlockStart}
              setDragBlockCurrent={setDragBlockCurrent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  day,
  meetings,
  ghostMeetings,
  blockedTimes,
  conflicts,
  isBlockingMode,
  dragBlockStart,
  dragBlockCurrent,
  setDragBlockStart,
  setDragBlockCurrent,
}: {
  day: DayOfWeek;
  meetings: ScheduledMeeting[];
  ghostMeetings: (ScheduledMeeting & { isHighlighted: boolean })[];
  blockedTimes: BlockedTime[];
  conflicts: any[];
  isBlockingMode: boolean;
  dragBlockStart: {day: DayOfWeek, index: number} | null;
  dragBlockCurrent: {day: DayOfWeek, index: number} | null;
  setDragBlockStart: (val: {day: DayOfWeek, index: number} | null) => void;
  setDragBlockCurrent: (val: {day: DayOfWeek, index: number} | null) => void;
}) {
  return (
    <div className="flex-1 border-r border-slate-200 last:border-r-0 relative select-none">
      {Array.from({ length: (END_HOUR - START_HOUR) * 2 }).map((_, i) => {
        let isDragSelected = false;
        if (dragBlockStart && dragBlockCurrent) {
          const dayIdx = DAYS.indexOf(day);
          const startDayIdx = DAYS.indexOf(dragBlockStart.day);
          const currentDayIdx = DAYS.indexOf(dragBlockCurrent.day);
          const minDayIdx = Math.min(startDayIdx, currentDayIdx);
          const maxDayIdx = Math.max(startDayIdx, currentDayIdx);

          const minIdx = Math.min(dragBlockStart.index, dragBlockCurrent.index);
          const maxIdx = Math.max(dragBlockStart.index, dragBlockCurrent.index);

          if (dayIdx >= minDayIdx && dayIdx <= maxDayIdx && i >= minIdx && i <= maxIdx) {
            isDragSelected = true;
          }
        }

        return (
          <TimeSlot 
            key={i} 
            day={day} 
            index={i} 
            isBlockingMode={isBlockingMode}
            isDragSelected={isDragSelected}
            onMouseDown={() => {
              setDragBlockStart({day, index: i});
              setDragBlockCurrent({day, index: i});
            }}
            onMouseEnter={() => {
              if (dragBlockStart) {
                setDragBlockCurrent({day, index: i});
              }
            }}
          />
        );
      })}

      {blockedTimes.map((bt) => (
        <BlockedBlock key={bt.id} blockedTime={bt} />
      ))}

      {ghostMeetings.map((m) => (
        <GhostMeetingBlock key={m.id} meeting={m} />
      ))}

      {meetings.map((m) => {
        const hasConflict = conflicts.some(
          (c) => c.item1Id === m.id || c.item2Id === m.id
        );
        return <MeetingBlock key={m.id} meeting={m} hasConflict={hasConflict} />;
      })}
    </div>
  );
}

function MeetingBlock({ meeting, hasConflict }: { meeting: ScheduledMeeting; hasConflict: boolean }) {
  const setLectureSection = useScheduleStore((s) => s.setLectureSection);
  const setLabSection = useScheduleStore((s) => s.setLabSection);
  const startMins = meeting.startMinutes - START_HOUR * 60;
  const durationMins = meeting.endMinutes - meeting.startMinutes;
  
  const top = (startMins / MIN_PER_CELL) * 1.5; // 1.5rem = 24px per 30 mins (h-6)
  const height = (durationMins / MIN_PER_CELL) * 1.5;

  const isLec = meeting.type === "LEC";

  return (
    <div
      className={`absolute left-[1px] right-[1px] rounded-none p-1.5 text-[12px] overflow-hidden shadow-none border z-20 group ${
        hasConflict
          ? "bg-portal-danger border-portal-danger text-white"
          : isLec 
            ? "bg-portal-blue border-portal-blue text-white"
            : "bg-portal-utility border-portal-utility text-white"
      }`}
      style={{ top: `${top}rem`, height: `${height}rem` }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (meeting.type === "LEC") {
            setLectureSection(meeting.courseId, "");
          } else {
            setLabSection(meeting.courseId, null);
          }
        }}
        className="absolute top-1 right-1 p-0.5 rounded-sm bg-white/20 hover:bg-white text-white hover:text-portal-danger opacity-0 group-hover:opacity-100 transition-opacity z-30"
        title="Unschedule section"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="font-bold leading-tight pr-4">
        {meeting.courseId}
      </div>
      {meeting.location && (
        <div className="text-[10px] opacity-90 leading-tight truncate">
          {meeting.location}
        </div>
      )}
      {hasConflict && (
        <div className="absolute bottom-1 right-1 bg-white text-portal-danger rounded-sm w-4 h-4 flex items-center justify-center text-[10px] font-bold">
          !
        </div>
      )}
    </div>
  );
}

function GhostMeetingBlock({ meeting }: { meeting: ScheduledMeeting & { isHighlighted: boolean } }) {
  const startMins = meeting.startMinutes - START_HOUR * 60;
  const durationMins = meeting.endMinutes - meeting.startMinutes;
  
  const top = (startMins / MIN_PER_CELL) * 1.5;
  const height = (durationMins / MIN_PER_CELL) * 1.5;

  const isLec = meeting.type === "LEC";

  return (
    <div
      className={`absolute left-[1px] right-[1px] rounded-none p-1.5 text-[12px] overflow-hidden border transition-all duration-200 ${
        meeting.isHighlighted
          ? isLec
            ? "bg-portal-blue/20 border-2 border-portal-blue text-portal-blue z-10 shadow-none scale-[1.02]"
            : "bg-portal-utility/20 border-2 border-portal-utility text-portal-utility z-10 shadow-none scale-[1.02]"
          : "bg-slate-100/50 border-portal-border border-dashed text-portal-text-secondary z-0"
      }`}
      style={{ top: `${top}rem`, height: `${height}rem` }}
    >
      <div className="font-bold leading-tight">
        {meeting.courseId}
      </div>
      {meeting.location && (
        <div className="text-[10px] opacity-90 leading-tight truncate">
          {meeting.location}
        </div>
      )}
    </div>
  );
}

function BlockedBlock({ blockedTime }: { blockedTime: BlockedTime }) {
  const removeBlockedTime = useScheduleStore((s) => s.removeBlockedTime);
  const activeSemesterId = useScheduleStore((s) => s.activeSemesterId);

  const startMins = timeToMinutes(blockedTime.startTime) - START_HOUR * 60;
  const durationMins = timeToMinutes(blockedTime.endTime) - timeToMinutes(blockedTime.startTime);
  
  const top = (startMins / MIN_PER_CELL) * 1.5;
  const height = (durationMins / MIN_PER_CELL) * 1.5;

  return (
    <div
      className="absolute left-0 right-0 flex items-center justify-center group cursor-pointer z-10 rounded-none overflow-hidden"
      style={{ 
        top: `${top}rem`, 
        height: `${height}rem`,
        backgroundColor: 'var(--color-portal-text-secondary)',
        color: 'white',
        opacity: 0.9
      }}
      onClick={() => removeBlockedTime(activeSemesterId, blockedTime.id)}
      title="Click to remove blocked time"
    >
      <span className="text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        Remove
      </span>
    </div>
  );
}

function TimeSlot({ 
  day, 
  index,
  isBlockingMode,
  isDragSelected,
  onMouseDown,
  onMouseEnter
}: { 
  day: DayOfWeek; 
  index: number;
  isBlockingMode: boolean;
  isDragSelected: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${day}-${index}`,
    data: { day, index },
    disabled: isBlockingMode,
  });

  return (
    <div
      ref={setNodeRef}
      onMouseDown={isBlockingMode ? onMouseDown : undefined}
      onMouseEnter={isBlockingMode ? onMouseEnter : undefined}
      className={`h-[24px] border-b border-portal-border-light last:border-b-0 transition-colors ${
        isOver && !isBlockingMode ? "bg-portal-blue/10" : ""
      } ${isDragSelected ? "bg-portal-text-secondary/30" : ""} ${isBlockingMode ? "cursor-crosshair hover:bg-portal-text-secondary/10" : ""}`}
    />
  );
}
