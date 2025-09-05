const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semesterController");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/", asyncHandler(semesterController.getAllSemesters));
router.get("/program/:programId", asyncHandler(semesterController.getSemestersByProgram));
router.get("/:id", asyncHandler(semesterController.getSemesterById));
router.post("/", asyncHandler(semesterController.createSemester));
router.put("/:id", asyncHandler(semesterController.updateSemester));
router.delete("/:id", asyncHandler(semesterController.deleteSemester));

// New semester content routes
router.post("/:id/semester-content", asyncHandler(semesterController.addSemesterContent));
router.get("/:id/semester-content/:semesterNumber", asyncHandler(semesterController.getSemesterContent));

// Course routes (now require semesterNumber in body)
router.post("/:id/courses", asyncHandler(semesterController.addCourse));
router.delete("/:id/courses/:courseId", asyncHandler(semesterController.removeCourse));

// Student routes (now require semesterNumber in body)
router.post("/:id/students", asyncHandler(semesterController.addStudent));
router.post("/:id/students/bulk", asyncHandler(semesterController.addMultipleStudents));
router.delete("/:id/students/:studentId", asyncHandler(semesterController.removeStudent));

module.exports = router;