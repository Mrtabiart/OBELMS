const Student = require('../models/studentModel');
const Semester = require('../models/semesterModel');
const Subject = require('../models/subjectModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.getSubjectsForStudent = async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user.id) {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated", subjects: [] });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-temporary-secret-key');
        if (decoded.role !== 'student') {
          return res.status(403).json({ message: "Access denied", subjects: [] });
        }

        req.session = req.session || {};
        req.session.user = {
          id: decoded.id,
          role: decoded.role
        };
      } catch (err) {
        return res.status(401).json({ message: "Invalid token", subjects: [] });
      }
    }

    const studentId = req.session.user.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    // Find the student to get their semesterId
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.semesterId) {
      return res.status(404).json({ message: "Student is not enrolled in any semester" });
    }

    // Find the semester using semesterId from student document
    const semester = await Semester.findById(student.semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    // If semester has no courses, return empty array
    if (!semester.courses || semester.courses.length === 0) {
      return res.status(200).json([]);
    }

    // Extract the courseIds from the semester
    const courseIds = semester.courses.map(course => course.courseId);

    // Find subjects that match the course IDs
    const subjects = await Subject.find({ 
      code: { $in: courseIds } 
    }).select('name code creditHours isLab');

    // For each subject, find the corresponding course to get the teacher
    const formattedSubjects = subjects.map(subject => {
      const matchingCourse = semester.courses.find(course => 
        course.courseId === subject.code
      );
      
      return {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        creditHours: subject.creditHours,
        isLab: subject.isLab,
      };
    });

    res.status(200).json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching student subjects:", error);
    res.status(500).json({
      message: "Failed to fetch subjects",
      error: error.message
    });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user.id) {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-temporary-secret-key');
        if (decoded.role !== 'student') {
          return res.status(403).json({ message: "Access denied" });
        }

        req.session = req.session || {};
        req.session.user = {
          id: decoded.id,
          role: decoded.role
        };
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    const studentId = req.session.user.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    // Find the student and return their profile information
    const student = await Student.findById(studentId).select('name email rollNumber');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({
      message: "Failed to fetch student profile",
      error: error.message
    });
  }
};