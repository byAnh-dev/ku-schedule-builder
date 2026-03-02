import { BlockedTime, Course, CourseComponent, DayOfWeek, ScheduledMeeting } from "./types";

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function formatMeetingPattern(component: CourseComponent): string {
  if (component.meetings.length === 0) return "TBA";
  const times = component.meetings
    .map((m) => `${m.days.join("")} ${m.startTime}-${m.endTime}`)
    .join(" / ");
  
  const parts = [times];
  if (component.instructor) parts.push(component.instructor);
  if (component.location) parts.push(component.location);
  
  return parts.join(" • ");
}

export function checkOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  // Overlap by >= 1 minute means start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

export const START_HOUR = 8;
export const END_HOUR = 20;
export const MIN_PER_CELL = 30;

export function computeTargetDays(dropDay: DayOfWeek): DayOfWeek[] {
  if (["M", "W", "F"].includes(dropDay)) return ["M", "W", "F"];
  if (["T", "Th"].includes(dropDay)) return ["T", "Th"];
  return [dropDay];
}

export function scoreSection(
  section: CourseComponent,
  targetDays: DayOfWeek[],
  exactDropDay: DayOfWeek,
  dropTime: number | null,
  existingMeetings: ScheduledMeeting[],
  blockedTimes: BlockedTime[]
): number {
  let score = 0;
  let conflictsWithExisting = 0;
  let overlapsBlockedTime = 0;
  let earliestStart = Infinity;
  let closestDistance = Infinity;

  for (const meeting of section.meetings) {
    const startMins = timeToMinutes(meeting.startTime);
    const endMins = timeToMinutes(meeting.endTime);

    if (startMins < earliestStart) earliestStart = startMins;

    for (const day of meeting.days) {
      if (day === exactDropDay) {
        score += 50;
        if (dropTime !== null) {
          const distance = Math.abs(startMins - dropTime);
          if (distance < closestDistance) closestDistance = distance;
        }
      } else if (targetDays.includes(day)) {
        score += 10;
      }

      // Check existing meetings overlap
      for (const existing of existingMeetings) {
        if (existing.day === day && checkOverlap(startMins, endMins, existing.startMinutes, existing.endMinutes)) {
          conflictsWithExisting++;
        }
      }

      // Check blocked time overlap
      for (const blocked of blockedTimes) {
        if (blocked.day === day && checkOverlap(startMins, endMins, timeToMinutes(blocked.startTime), timeToMinutes(blocked.endTime))) {
          overlapsBlockedTime++;
        }
      }
    }
  }

  score -= conflictsWithExisting * 20;
  score -= overlapsBlockedTime * 5;

  // Tie-breaker: distance to drop time, or earliest start time
  if (dropTime !== null && closestDistance !== Infinity) {
    score -= (closestDistance / 1440);
  } else {
    score -= (earliestStart / 1440);
  }

  return score;
}

export function getBestSection(
  course: Course,
  type: string,
  dropDay: DayOfWeek,
  dropTime: number | null,
  existingMeetings: ScheduledMeeting[],
  blockedTimes: BlockedTime[]
): CourseComponent | null {
  const isLecTarget = type === "LEC";
  const sections = course.components.filter((c) => isLecTarget ? c.type === "LEC" : c.type !== "LEC");
  if (sections.length === 0) return null;

  const targetDays = computeTargetDays(dropDay);
  let bestSection = sections[0];
  let bestScore = -Infinity;

  for (const section of sections) {
    const score = scoreSection(section, targetDays, dropDay, dropTime, existingMeetings, blockedTimes);
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  return bestSection;
}
