const mongoose = require('mongoose');
const Semester = require("../models/semesterModel");
const Program = require("../models/programModel");
const Subject = require("../models/subjectModel");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");

exports.getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find()
      .populate('programId', 'name code')
      .populate({
        path: 'courses.teacherId',
        model: 'Teacher',
        select: 'name email'
      })
      .populate({
        path: 'courses.subjectId',
        model: 'subject',  // Add model name
        select: 'code name isLab'
      })
      .sort({ startDate: -1 });
    
    res.status(200).json(semesters);
  } catch (error) {
    console.error("Error in getAllSemesters:", error);
    res.status(500).json({ 
      message: "Failed to fetch semesters",
      error: error.message
    });
  }
};

exports.getSemestersByProgram = async (req, res) => {
  try {
    const programId = req.params.programId;
    
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      return res.status(400).json({ message: "Invalid program ID format" });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    
    const semesters = await Semester.find({ programId })
      .populate('programId', 'name code')
      .populate({
        path: 'courses.teacherId',
        model: 'Teacher',
        select: 'name email'
      })
      .populate({
        path: 'courses.subjectId',
        model: 'subject',  // Add model name
        select: 'code name isLab'
      })
      .sort({ startDate: -1 });
    
    if (!semesters || semesters.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(semesters);
  } catch (error) {
    console.error("Error in getSemestersByProgram:", error);
    res.status(500).json({ 
      message: "Failed to fetch semesters",
      error: error.message
    });
  }
};

exports.getSemesterById = async (req, res) => {
  try {
    const semesterId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ message: "Invalid semester ID format" });
    }
    
    const semester = await Semester.findById(semesterId)
      .populate('programId', 'name code')
      .populate({
        path: 'courses.teacherId',
        model: 'Teacher',
        select: 'name email'
      })
      .populate({
        path: 'courses.subjectId',
        model: 'subject',  // Add model name
        select: 'code name isLab'
      });
    
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    res.status(200).json(semester);
  } catch (error) {
    console.error("Error in getSemesterById:", error);
    res.status(500).json({ 
      message: "Failed to fetch semester",
      error: error.message
    });
  }
};

exports.createSemester = async (req, res) => {
  try {
    const { programId, startDate, endDate, session } = req.body;
    
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    
    const newSemester = new Semester({
      programId,
      startDate,
      endDate,
      session,
      courses: [],
      students: []
    });
    
    const savedSemester = await newSemester.save();
    
    res.status(201).json(savedSemester);
  } catch (error) {
    console.error("Error creating semester:", error);
    res.status(500).json({ message: "Failed to create semester", error: error.message });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const { startDate, endDate, session } = req.body;
    
    const updatedSemester = await Semester.findByIdAndUpdate(
      req.params.id,
      { startDate, endDate, session },
      { new: true }
    )
    .populate({
      path: 'courses.teacherId',
      model: 'Teacher',
      select: 'name email'
    })
    .populate({
      path: 'courses.subjectId',
      model: 'subject',  // Add model name
      select: 'code name isLab'
    });
    
    if (!updatedSemester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    res.status(200).json(updatedSemester);
  } catch (error) {
    console.error("Error updating semester:", error);
    res.status(500).json({ message: "Failed to update semester", error: error.message });
  }
};

exports.deleteSemester = async (req, res) => {
  try {
    const deletedSemester = await Semester.findByIdAndDelete(req.params.id);
    
    if (!deletedSemester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    res.status(200).json({ message: "Semester deleted successfully" });
  } catch (error) {
    console.error("Error deleting semester:", error);
    res.status(500).json({ message: "Failed to delete semester", error: error.message });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { subjectId, teacherId } = req.body;
    const semesterId = req.params.id;
    
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    // Check if subject belongs to this program
    if (!subject.programId.equals(semester.programId)) {
      return res.status(400).json({ message: "Subject does not belong to this program" });
    }
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    const courseExists = semester.courses.some(course => 
      course.subjectId.equals(subjectId)
    );
    
    if (courseExists) {
      return res.status(400).json({ message: "Course already exists in this semester" });
    }
    
    semester.courses.push({ subjectId, teacherId });
    const updatedSemester = await semester.save();
    
    const semesterIndex = teacher.semesters.findIndex(sem => 
      sem.semesterId.equals(semester._id)
    );
    
    if (semesterIndex !== -1) {
      const subjectExists = teacher.semesters[semesterIndex].subjects.some(subId => 
        subId.equals(subject._id)
      );
      
      if (!subjectExists) {
        teacher.semesters[semesterIndex].subjects.push(subject._id);
      }
    } else {
      teacher.semesters.push({
        semesterId: semester._id,
        subjects: [subject._id]
      });
    }
    
    await teacher.save();
  
    const populatedSemester = await Semester.findById(updatedSemester._id)
      .populate({
        path: 'courses.teacherId',
        model: 'Teacher',
        select: 'name email'
      })
      .populate({
        path: 'courses.subjectId',
        model: 'subject',  // Add model name
        select: 'code name isLab'
      });
    
    res.status(200).json(populatedSemester);
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ message: "Failed to add course", error: error.message });
  }
};

exports.removeCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const semesterId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(semesterId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    const courseIndex = semester.courses.findIndex(course => course._id.toString() === courseId);
    
    if (courseIndex === -1) {
      return res.status(404).json({ message: "Course not found in this semester" });
    }
    
    const courseInfo = semester.courses[courseIndex];
    const teacherId = courseInfo.teacherId;
    const subjectId = courseInfo.subjectId;
    
    semester.courses.splice(courseIndex, 1);
    const updatedSemester = await semester.save();
    
    // Teacher update logic
    if (teacherId) {
      const teacher = await Teacher.findById(teacherId);
      if (teacher) {
        const semesterIndex = teacher.semesters.findIndex(sem => 
          sem.semesterId && sem.semesterId.toString() === semesterId
        );
        
        if (semesterIndex !== -1) {
          const subjectIndex = teacher.semesters[semesterIndex].subjects.findIndex(subId => 
            subId && subId.toString() === subjectId.toString()
          );
          
          if (subjectIndex !== -1) {
            teacher.semesters[semesterIndex].subjects.splice(subjectIndex, 1);
            
            if (teacher.semesters[semesterIndex].subjects.length === 0) {
              teacher.semesters.splice(semesterIndex, 1);
            }
            
            await teacher.save();
          }
        }
      }
    }
  
    const finalSemester = await Semester.findById(updatedSemester._id)
      .populate({
        path: 'courses.teacherId',
        model: 'Teacher',
        select: 'name email'
      })
      .populate({
        path: 'courses.subjectId',
        model: 'subject',
        select: 'code name isLab'
      });
    
    res.status(200).json({ 
      message: "Course removed successfully and teacher record updated", 
      semester: finalSemester 
    });
  } catch (error) {
    console.error("Error removing course:", error);
    res.status(500).json({ 
      message: "Failed to remove course", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
exports.addStudent = async (req, res) => {
  try {
    const { rollNumber, name, email } = req.body;
    const semesterId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ message: "Invalid semester ID format" });
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    const studentExists = semester.students.some(student =>
      student.rollNumber === rollNumber || student.email === email
    );
    if (studentExists) {
      return res.status(400).json({ message: "Student with this roll number or email already exists in this semester" });
    }

    const universityStudent = await Student.findOne({
      $and: [{ rollNumber }, { email }]
    });

    if (!universityStudent) {
      return res.status(400).json({
        message: "Student is not a registered university student",
        details: { rollNumber, name, email }
      });
    }

    if (universityStudent.semesterId) {
      return res.status(400).json({
        message: "Student is already assigned to a semester",
        details: { rollNumber, name, email, semesterId: universityStudent.semesterId }
      });
    }

    // Add student with document ID
    semester.students.push({ 
      rollNumber, 
      name, 
      email, 
      studentid: universityStudent._id 
    });
    const updatedSemester = await semester.save();

    universityStudent.semesterId = semester._id;
    await universityStudent.save();

    res.status(200).json({
      message: "Student added successfully",
      semester: updatedSemester
    });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({
      message: "Failed to add student",
      error: error.message
    });
  }
};

exports.addMultipleStudents = async (req, res) => {
  try {
    const { students } = req.body;
    const semesterId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ message: "Invalid semester ID format" });
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "Invalid student data format" });
    }

    const existingRollNumbers = new Set(semester.students.map(s => s.rollNumber));
    const existingEmails = new Set(semester.students.map(s => s.email));

    const validStudents = [];
    const invalidStudents = [];

    for (const student of students) {
      if (existingRollNumbers.has(student.rollNumber)) {
        invalidStudents.push({
          ...student,
          reason: "Already exists in this semester"
        });
        continue;
      }

      if (existingEmails.has(student.email)) {
        invalidStudents.push({
          ...student,
          reason: "Email already exists in this semester"
        });
        continue;
      }

      const universityStudent = await Student.findOne({
        $and: [
          { rollNumber: student.rollNumber },
          { email: student.email }
        ]
      });

      if (!universityStudent) {
        invalidStudents.push({
          ...student,
          reason: "Not a registered university student"
        });
        continue;
      }

      if (universityStudent.semesterId) {
        invalidStudents.push({
          ...student,
          reason: "Student is already assigned to a semester"
        });
        continue;
      }

      validStudents.push({
        studentData: student,
        universityStudent
      });
    }

    if (validStudents.length === 0 && invalidStudents.length > 0) {
      return res.status(400).json({
        message: "No valid students to add",
        invalidStudents
      });
    }

    const studentsToAdd = validStudents.map(v => ({
      rollNumber: v.studentData.rollNumber,
      name: v.studentData.name,
      email: v.studentData.email,
      studentid: v.universityStudent._id
    }));

    semester.students = [...semester.students, ...studentsToAdd];
    const updatedSemester = await semester.save();

    await Promise.all(
      validStudents.map(async (v) => {
        v.universityStudent.semesterId = semester._id;
        await v.universityStudent.save();
      })
    );

    const response = {
      message: `${validStudents.length} students added successfully`,
      semester: updatedSemester
    };

    if (invalidStudents.length > 0) {
      response.invalidStudents = invalidStudents;
      response.warning = `${invalidStudents.length} students could not be added`;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding multiple students:", error);
    res.status(500).json({
      message: "Failed to add students",
      error: error.message
    });
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const semesterId = req.params.id;
    
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    
    const studentIndex = semester.students.findIndex(student => student._id.toString() === studentId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ message: "Student not found in this semester" });
    }
    
    const studentRollNumber = semester.students[studentIndex].rollNumber;
    const studentDocumentId = semester.students[studentIndex].studentid;
    
    const universityStudent = await Student.findById(studentDocumentId || studentRollNumber);
    
    if (universityStudent) {
      universityStudent.semesterId = null;
      await universityStudent.save();
    }
    
    semester.students.splice(studentIndex, 1);
    const updatedSemester = await semester.save();
    
    res.status(200).json({ 
      message: "Student removed successfully from semester and student record updated", 
      semester: updatedSemester 
    });
  } catch (error) {
    console.error("Error removing student:", error);
    res.status(500).json({ message: "Failed to remove student", error: error.message });
  }
};