import { z } from "zod";

const zStudentId = z
  .string()
  .length(9, { message: "Student Id must contain 9 characters" });
const zFirstName = z
  .string()
  .min(3, { message: "First name requires at least 3 charaters" });
const zLastName = z
  .string()
  .min(3, { message: "Last name requires at least 3 characters" });
const zProgram = z.enum(["CPE", "ISNE"], {
  message: "Program must be either CPE or ISNE",
});
const zprogramId = z.number().refine((val) => val === 101 || val === 102, {
  message: "Program Id must be either 101 or 102",
});
const zCourse = z.array(z.number());

export const zStudentPostBody = z.object({
  studentId: zStudentId,
  firstName: zFirstName,
  lastName: zLastName,
  program: zProgram,
  programId: zprogramId,
  course: zCourse.nullish(),
});

export const zStudentPutBody = z.object({
  studentId: zStudentId,
  firstName: zFirstName.nullish(), //firstName can be null or undefined
  lastName: zLastName.nullish(), //lastName can be null or undefined
  program: zProgram.nullish(), //program can be null or undefined
  programId: zprogramId.nullish(), //programId can be null or undefined
});

export const zStudentDeleteBody = z.object({
  studentId: zStudentId,
});
