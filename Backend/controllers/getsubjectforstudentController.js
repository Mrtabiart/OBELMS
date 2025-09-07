const Student = require('../models/studentModel');
const Semester = require('../models/semesterModel');
const Subject = require('../models/subjectModel');
const Teacher = require('../models/teacherModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.getSubjectsForStudent = async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user.id) {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated", groups: [] });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-temporary-secret-key');
        if (decoded.role !== 'student') {
          return res.status(403).json({ message: "Access denied", groups: [] });
        }

        req.session = req.session || {};
        req.session.user = {
          id: decoded.id,
          role: decoded.role
        };
      } catch (err) {
        return res.status(401).json({ message: "Invalid token", groups: [] });
      }
    }

    const studentId = req.session.user.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.semesterId) {
      return res.status(404).json({ message: "Student is not enrolled in any semester" });
    }

    const semester = await Semester.findById(student.semesterId).lean();
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    const contents = Array.isArray(semester.semesterContents) ? semester.semesterContents : [];

    if (contents.length === 0) {
      return res.status(200).json({ 
        groups: [],
        semesterInfo: {
          semesterId: semester._id,
          startDate: semester.startDate,
          endDate: semester.endDate,
          session: semester.session
        }
      });
    }

    // Collect unique subject and teacher IDs across all contents
    const subjectIdSet = new Set();
    const teacherIdSet = new Set();

    contents.forEach(sc => {
      const courses = Array.isArray(sc.courses) ? sc.courses : [];
      courses.forEach(c => {
        if (c.subjectId) subjectIdSet.add(String(c.subjectId));
        if (c.teacherId) teacherIdSet.add(String(c.teacherId));
      });
    });

    const subjectIds = Array.from(subjectIdSet).map(id => new mongoose.Types.ObjectId(id));
    const teacherIds = Array.from(teacherIdSet).map(id => new mongoose.Types.ObjectId(id));

    // Fetch subjects and teachers in batches
    const [subjects, teachers] = await Promise.all([
      subjectIds.length ? Subject.find({ _id: { $in: subjectIds } }).select('name code creditHours isLab').lean() : [],
      teacherIds.length ? Teacher.find({ _id: { $in: teacherIds } }).select('name').lean() : []
    ]);

    const subjectMap = new Map(subjects.map(s => [String(s._id), s]));
    const teacherMap = new Map(teachers.map(t => [String(t._id), t]));

    // Build grouped response by semesterNumber
    const groups = contents
      .sort((a, b) => (a.semesterNumber || 0) - (b.semesterNumber || 0))
      .map(sc => {
        const courses = (sc.courses || []).map(c => {
          const subj = c.subjectId ? subjectMap.get(String(c.subjectId)) : null;
          const teacher = c.teacherId ? teacherMap.get(String(c.teacherId)) : null;

          return {
            subjectId: c.subjectId || null,
            teacherId: c.teacherId || null,
            semesterNumber: c.semesterNumber,
            _id: subj?._id || c.subjectId || null,
            name: subj?.name || 'Unknown Subject',
            code: subj?.code || '',
            creditHours: subj?.creditHours ?? null,
            isLab: !!subj?.isLab,
            teacherName: teacher?.name || 'Unknown Teacher',
            semesterId: semester._id,
            startDate: semester.startDate,
            endDate: semester.endDate,
            session: semester.session
          };
        });

        return {
          semesterNumber: sc.semesterNumber,
          courses
        };
      });

    return res.status(200).json({ 
      groups,
      semesterInfo: {
        semesterId: semester._id,
        startDate: semester.startDate,
        endDate: semester.endDate,
        session: semester.session
      }
    });
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