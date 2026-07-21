import express, { type Request, type Response } from "express";

// import middleware
import morgan from "morgan";

// import database with relative paths for Vercel compatibility
import { students } from "./db/db.js";
import { type Student } from "./libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "./libs/studentValidator.js";

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json()); // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /api/students
// get students (by studentId and/or program)
app.get("/api/students", (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId as string;
    const program = req.query.program as string;

    let filtered_students = [...students];

    // กรองตาม studentId (ถ้ามี)
    if (studentId) {
      filtered_students = filtered_students.filter(
        (student) => student.studentId === studentId,
      );
    }

    // กรองตาม program ต่อจากที่กรองไว้แล้ว (ถ้ามี)
    if (program) {
      filtered_students = filtered_students.filter(
        (student) => student.program.toLowerCase() === program.toLowerCase(),
      );
    }

    return res.json({
      ok: true,
      students: filtered_students,
    });
  } catch (err) {
    return res.json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/students, body = {new student data}
// add a new student
app.post("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body);
    if (!result.success) {
      return res.json({
        ok: false,
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    // check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId,
    );
    if (found) {
      return res.json({
        ok: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/api/students/${new_student.studentId}`);

    return res.json({
      ok: true,
      data: new_student,
    });
  } catch (err) {
    return res.json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// PUT /api/students, body = {studentId}
// Update specified student
app.put("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body);
    if (!result.success) {
      return res.json({
        ok: false,
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    // check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId,
    );

    if (foundIndex === -1) {
      return res.json({
        ok: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/api/students/${body.studentId}`);

    return res.json({
      ok: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /api/students, body = {studentId}
app.delete("/api/students", (req: Request, res: Response) => {
  try {
    const result = zStudentDeleteBody.safeParse(req.body);

    // รหัสนักศึกษาไม่ถูกต้อง (ไม่เท่ากับ 9 หลัก) -> 400 Bad Request
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: "Student Id must contain 9 characters",
      });
    }

    const { studentId } = result.data;
    const foundIndex = students.findIndex(
      (student) => student.studentId === studentId,
    );

    // ไม่พบนักศึกษาในระบบ -> 404 Not Found
    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Student ID does not exist",
      });
    }

    // ลบนักศึกษาออกจากระบบ
    students.splice(foundIndex, 1);

    return res.json({
      ok: true,
      message: `Student Id ${studentId} has been deleted`,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// GET /api/me
app.get("/api/me", (req: Request, res: Response) => {
  return res.json({
    ok: true,
    fullName: "นภัสดล จำปา",
    studentId: "680610687",
  });
});

// Only listen locally, Vercel handles the listener automatically
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
