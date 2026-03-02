import { Course, Semester } from "./types";

const semesters: Semester[] = [
  { id: "2026SP", label: "Spring 2026" },
  { id: "2026FA", label: "Fall 2026" },
];

const courses: Course[] = [
  {
    id: "EECS 388",
    subject: "EECS",
    number: "388",
    title: "Intro to Computer Security",
    description: "This course introduces the principles and practices of computer security as applied to software, host systems, and networks.",
    credits: 4,
    semesterId: "2026SP",
    prerequisites: "EECS 281",
    components: [
      {
        id: "eecs388-lec-001",
        type: "LEC",
        section: "001",
        instructor: "J. Halderman",
        location: "Summerfield 203",
        rmpRating: 4.5,
        rmpDifficulty: 3.8,
        rmpUrl: "https://www.ratemyprofessors.com/professor/123456",
        meetings: [
          { days: ["M", "W", "F"], startTime: "10:00", endTime: "10:50" },
        ],
      },
      {
        id: "eecs388-lec-002",
        type: "LEC",
        section: "002",
        instructor: "M. Bailey",
        location: "Dow 1013",
        meetings: [
          { days: ["T", "Th"], startTime: "13:00", endTime: "14:15" },
        ],
      },
    ],
  },
  {
    id: "MATH 127",
    subject: "MATH",
    number: "127",
    title: "Calculus II",
    description: "Methods of integration, applications of the integral, Taylor's theorem, infinite sequences and series.",
    credits: 4,
    semesterId: "2026SP",
    prerequisites: "MATH 115",
    components: [
      {
        id: "math127-lec-001",
        type: "LEC",
        section: "001",
        instructor: "S. Smith",
        location: "Mason Hall 414",
        rmpRating: 3.2,
        rmpDifficulty: 4.5,
        rmpUrl: "https://www.ratemyprofessors.com/professor/789012",
        meetings: [
          { days: ["T", "Th"], startTime: "10:00", endTime: "11:15" },
        ],
      },
      {
        id: "math127-lab-001",
        type: "LAB",
        section: "001",
        instructor: "T. Assistant",
        location: "East Hall 1084",
        meetings: [
          { days: ["M"], startTime: "14:00", endTime: "15:50" },
        ],
      },
      {
        id: "math127-lab-002",
        type: "LAB",
        section: "002",
        instructor: "T. Assistant",
        location: "East Hall 1084",
        meetings: [
          { days: ["W"], startTime: "14:00", endTime: "15:50" },
        ],
      },
    ],
  },
  {
    id: "PHYS 140",
    subject: "PHYS",
    number: "140",
    title: "General Physics I",
    description: "Calculus-based introduction to classical mechanics, including kinematics, Newton's laws, and energy.",
    credits: 4,
    semesterId: "2026SP",
    prerequisites: "MATH 115",
    components: [
      {
        id: "phys140-lec-001",
        type: "LEC",
        section: "001",
        instructor: "D. Winn",
        location: "Randall 1420",
        rmpRating: 4.8,
        rmpDifficulty: 2.5,
        rmpUrl: "https://www.ratemyprofessors.com/professor/246810",
        meetings: [
          { days: ["M", "W", "F"], startTime: "10:49", endTime: "11:50" },
        ],
      },
    ],
  },
  {
    id: "EECS 281",
    subject: "EECS",
    number: "281",
    title: "Data Structures and Algorithms",
    description: "Introduction to algorithm analysis and O-notation; Fundamental data structures including lists, stacks, queues, priority queues, hash tables, binary trees, search trees, balanced trees and graphs.",
    credits: 4,
    semesterId: "2026FA",
    prerequisites: "EECS 280",
    components: [
      {
        id: "eecs281-lec-001",
        type: "LEC",
        section: "001",
        instructor: "M. Darden",
        location: "Chrysler 220",
        rmpRating: 4.2,
        rmpDifficulty: 4.1,
        rmpUrl: "https://www.ratemyprofessors.com/professor/135792",
        meetings: [
          { days: ["M", "W"], startTime: "10:30", endTime: "11:50" },
        ],
      },
    ],
  },
];

export async function listSemesters(): Promise<Semester[]> {
  return new Promise((resolve) => setTimeout(() => resolve(semesters), 200));
}

export async function searchCourses({
  semesterId,
  query,
}: {
  semesterId: string;
  query: string;
}): Promise<Course[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedQuery = query.replace(/\s+/g, "").toLowerCase();
      const results = courses.filter(
        (c) =>
          c.semesterId === semesterId &&
          c.id.replace(/\s+/g, "").toLowerCase().includes(normalizedQuery)
      );
      resolve(results);
    }, 300);
  });
}

export async function getCourseById({
  semesterId,
  courseId,
}: {
  semesterId: string;
  courseId: string;
}): Promise<Course | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        courses.find((c) => c.semesterId === semesterId && c.id === courseId)
      );
    }, 100);
  });
}
