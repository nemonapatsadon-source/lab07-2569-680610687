interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  program: "CPE" | "ISNE";
  programId: 101 | 102;
  courses?: number[];
}
export type { Student };

interface Course {
  courseId: number;
  courseTitle: string;
  instructors: string[];
}
export type { Course };
