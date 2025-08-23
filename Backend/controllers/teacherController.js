const Teacher = require('../models/teacherModel');
const Program = require('../models/programModel');
const Trash = require('../models/trashModel'); 
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const configureStorage = (entityType) => {
  return multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadDir = path.join(__dirname, `../uploads/${entityType}`);
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${entityType}-${uniqueSuffix}${ext}`);
    }
  });
};

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and GIF are allowed.'), false);
  }
};

const configureUpload = (entityType, fileSize = 5) => {
  return multer({
    storage: configureStorage(entityType),
    limits: {
      fileSize: fileSize * 1024 * 1024 
    },
    fileFilter: imageFileFilter
  });
};

exports.upload = configureUpload('teachers');

exports.getTeachersByProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const teachers = await Teacher.find({ 'programs.programId': programId });
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getTeachersBySemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const teachers = await Teacher.find({ 'semesters.semesterId': semesterId });
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getTeachersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subjectObjId = new mongoose.Types.ObjectId(subjectId);
    const teachers = await Teacher.find({ 'semesters.subjects': subjectObjId });
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { name, email, qualifications, programId } = req.body;
    const existingTeacher = await Teacher.findOne({ name, email });
    
    const photoPath = req.file ? `/uploads/teachers/${path.basename(req.file.path)}` : null;

    if (existingTeacher) {
      const hasProgram = existingTeacher.programs.some(p => p.programId.equals(programId));
      if (hasProgram) return res.status(400).json({ message: 'Teacher already in this program' });

      existingTeacher.programs.push({ programId });
      
      if (photoPath) {
        if (existingTeacher.photo) {
          const oldPhotoPath = path.join(__dirname, '..', existingTeacher.photo);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        existingTeacher.photo = photoPath;
      }
      
      await existingTeacher.save();
      return res.status(200).json(existingTeacher);
    } else {
      const newTeacher = new Teacher({
        name,
        email,
        qualifications,
        photo: photoPath,
        programs: [{ programId }],
        semesters: [] 
      });
      await newTeacher.save();
      res.status(201).json(newTeacher);
    }
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Teacher with this name and email already exists' });
    } else {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, qualifications } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.name = name || teacher.name;
    teacher.email = email || teacher.email;
    teacher.qualifications = qualifications || teacher.qualifications;
    
    if (req.file) {
      if (teacher.photo) {
        const oldPhotoPath = path.join(__dirname, '..', teacher.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      teacher.photo = `/uploads/teachers/${path.basename(req.file.path)}`;
    }

    await teacher.save();
    res.status(200).json(teacher);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { semesterId, subjectId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(teacherId) || 
        !mongoose.Types.ObjectId.isValid(semesterId) || 
        !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    
    const semesterIndex = teacher.semesters.findIndex(
      s => s.semesterId.equals(semesterId)
    );
    
    if (semesterIndex !== -1) {
      const subjectExists = teacher.semesters[semesterIndex].subjects.some(
        s => s.equals(subjectId)
      );
      
      if (subjectExists) {
        return res.status(400).json({ message: 'Subject already assigned to this teacher in this semester' });
      }
      
      teacher.semesters[semesterIndex].subjects.push(subjectId);
    } else {
      teacher.semesters.push({
        semesterId,
        subjects: [subjectId]
      });
    }
    
    await teacher.save();
    res.status(200).json(teacher);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.removeSubjectFromTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { semesterId, subjectId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(teacherId) || 
        !mongoose.Types.ObjectId.isValid(semesterId) || 
        !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  
    const semesterIndex = teacher.semesters.findIndex(
      s => s.semesterId.equals(semesterId)
    );
    
    if (semesterIndex === -1) {
      return res.status(404).json({ message: 'Semester not found for this teacher' });
    }
    
    const subjectIndex = teacher.semesters[semesterIndex].subjects.findIndex(
      s => s.equals(subjectId)
    );
    
    if (subjectIndex === -1) {
      return res.status(404).json({ message: 'Subject not found in this semester' });
    }
    
    teacher.semesters[semesterIndex].subjects.splice(subjectIndex, 1);
    
    if (teacher.semesters[semesterIndex].subjects.length === 0) {
      teacher.semesters.splice(semesterIndex, 1);
    }
    
    await teacher.save();
    res.status(200).json({ message: 'Subject removed from teacher' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { programId, deletedBy = 'admin' } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(programId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const teacher = await Teacher.findById(id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    
    const hasProgram = teacher.programs.some(p => p.programId.equals(programId));
    if (!hasProgram) return res.status(400).json({ message: 'Teacher not in this program' });

    teacher.programs = teacher.programs.filter(p => !p.programId.equals(programId));
    await teacher.save();
    
    const programObjId = new mongoose.Types.ObjectId(programId);
    let trashEntry = await Trash.findOne({ 
      originalCollection: 'teachers', 
      originalId: teacher._id 
    });
    
    if (!trashEntry) {
      const teacherData = teacher.toObject();
      teacherData.programs = [{ programId: programObjId }];
      
      const newTrash = new Trash({
        originalCollection: 'teachers',
        originalId: teacher._id,
        data: teacherData,
        deletedBy,
        deletedAt: new Date()
      });
      
      await newTrash.save();
    } else {
      if (!trashEntry.data.programs) {
        trashEntry.data.programs = [];
      }
      
      trashEntry.data.programs.push({ programId: programObjId });
      trashEntry.deletedAt = new Date(); 
      trashEntry.markModified('data.programs');
      
      await trashEntry.save();
    }
    
    return res.status(200).json({ message: 'Program removed from teacher. Trash updated.' });
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.restoreTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const trashEntry = await Trash.findById(id);
    if (!trashEntry) return res.status(404).json({ message: 'Trash entry not found' });

    const { originalId, data } = trashEntry;
    const programIdsToRestore = data.programs.map(p => p.programId.toString());

    const existingTeacher = await Teacher.findById(originalId);

    if (existingTeacher) {
      const currentProgramIds = existingTeacher.programs.map(p => p.programId.toString());

      programIdsToRestore.forEach(pid => {
        if (!currentProgramIds.includes(pid)) {
          existingTeacher.programs.push({ programId: pid });
        }
      });

      await existingTeacher.save();

      for (let i = trashEntry.data.programs.length - 1; i >= 0; i--) {
        const prog = trashEntry.data.programs[i];
        if (programIdsToRestore.includes(prog.programId.toString())) {
          trashEntry.data.programs.splice(i, 1);
        }
      }

      if (trashEntry.data.programs.length === 0) {
        await Trash.findByIdAndDelete(id);
      } else {
        await trashEntry.save();
      }

      return res.status(200).json({ message: 'Programs restored to existing teacher.' });

    } else {
      const restoredTeacher = new Teacher({
        _id: originalId,
        ...data,
        programs: data.programs,
        semesters: data.semesters || [] 
      });

      await restoredTeacher.save();
      await Trash.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Teacher fully restored.' });
    }
  } catch (err) {
    console.error('Error restoring teacher:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};