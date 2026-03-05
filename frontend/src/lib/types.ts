export type DayOfWeek = "M" | "T" | "W" | "Th" | "F" | "Sa" | "Su";

export interface Semester {
  id: string;
  label: string;
}

export interface Meeting {
  days: DayOfWeek[];
  startTime: string; // "10:00" (24h)
  endTime: string;   // "10:50"
}

export interface CourseComponent {
  id: string; // unique section id
  type: "LEC" | "LAB" | "DIS" | "REC";
  section: string; // "001", "A", etc.
  meetings: Meeting[];
  instructor?: string;
  location?: string;
  rmpRating?: number;
  rmpDifficulty?: number;
  rmpUrl?: string;
  seatAvailable?: number | "Full" | null;
  crn?: string;
}

export interface Course {
  id: string; // "EECS 388"
  subject: string; // "EECS"
  number: string; // "388"
  title: string;
  description?: string;
  credits?: number;
  semesterId: string;
  components: CourseComponent[];
  prerequisites?: string;
}

export interface BlockedTime {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface ScheduledMeeting {
  id: string;
  courseId: string;
  componentId: string;
  type: string;
  section: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  location?: string;
  instructor?: string;
  seatAvailable?: number | "Full" | null;
}

export interface Conflict {
  id: string;
  type: "course-course" | "course-blocked";
  message: string;
  item1Id?: string; // scheduled meeting id or blocked time id
  item2Id?: string;
}
