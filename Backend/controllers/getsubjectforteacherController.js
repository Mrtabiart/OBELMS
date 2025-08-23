const Teacher = require('../models/teacherModel');
const Subject = require('../models/subjectModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

exports.getSubjectsForTeacher = async (req, res) => {
  try {
   
    if (!req.session || !req.session.user || !req.session.user.id) {
     
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          message: "Not authenticated or session expired",
          subjects: []
        });
      }

      try {
        const jwtSecret = process.env.JWT_SECRET || "your-temporary-secret-key";
        const decoded = jwt.verify(token, jwtSecret);

        if (decoded.role !== "teacher") {
          return res.status(403).json({
            message: "Access denied: User is not a teacher",
            subjects: []
          });
        }

        req.session = req.session || {};
        req.session.user = {
          id: decoded.id,
          role: decoded.role
        };
      } catch (err) {
        return res.status(401).json({
          message: "Invalid authentication token",
          subjects: []
        });
      }
    }

    const teacherId = req.session.user.id;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid teacher ID format" });
    }

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    
    if (!teacher.semesters || teacher.semesters.length === 0) {
      return res.status(200).json([]);
    }

    
    const subjectSemesterMap = new Map();
    
    
    teacher.semesters.forEach(semester => {
      if (semester.subjects && semester.subjects.length > 0) {
        semester.subjects.forEach(subjectId => {
          const subjectIdStr = subjectId.toString();
          
          
          if (subjectSemesterMap.has(subjectIdStr)) {
            subjectSemesterMap.get(subjectIdStr).semesters.push(semester.semesterId);
          } else {
           
            subjectSemesterMap.set(subjectIdStr, {
              subjectId: subjectId,
              semesters: [semester.semesterId]
            });
          }
        });
      }
    });

    
    if (subjectSemesterMap.size === 0) {
      return res.status(200).json([]);
    }

   
    const subjectIdsArray = Array.from(subjectSemesterMap.keys()).map(id => 
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
    );

    
    const subjects = await Subject.find({ _id: { $in: subjectIdsArray } })
      .select('name code creditHours isLab');

    
    const formattedSubjects = subjects.map(subject => {
      const subjectData = subjectSemesterMap.get(subject._id.toString());
      
      return {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
         isLab: subject.isLab,
        creditHours: subject.creditHours,
        semesters: subjectData.semesters 
      };
    });

    res.status(200).json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching subjects for teacher:", error);
    res.status(500).json({
      message: "Failed to fetch subjects",
      error: error.message
    });
  }
};
