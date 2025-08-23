const Subject = require('../models/subjectModel');
const Program = require('../models/programModel');

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('programId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getSubjectsByProgram = async (req, res) => {
  try {
    const programId = req.params.programId;
    
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    const subjects = await Subject.find({ programId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(subjects);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid program ID' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('programId', 'name coordinatorName');
      
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.status(200).json(subject);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createSubject = async (req, res) => {
  const { name, code, programId, creditHours, isLab, clos } = req.body;
  
  try {
    if (!name || !code || !programId || !creditHours) {
      return res.status(400).json({ message: 'Name, code, program ID and credit hours are required' });
    }

    if (creditHours < 1 || creditHours > 6) {
      return res.status(400).json({ message: 'Credit hours must be between 1 and 6' });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: 'A subject with this code already exists' });
    }
    
    if (clos && clos.length > 0) {
      for (const clo of clos) {
        const ploExists = program.plos.some(plo => plo.number === clo.ploNumber);
        if (!ploExists) {
          return res.status(400).json({ 
            message: `PLO number ${clo.ploNumber} referenced in CLO ${clo.number} does not exist in this program` 
          });
        }
      }
    }
    
    const subject = new Subject({
      name,
      code,
      creditHours,
      isLab: isLab || false, 
      programId,
      clos: clos || []
    });
    
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateSubject = async (req, res) => {
  const { name, code, creditHours, isLab, clos } = req.body;
  
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('programId');
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    if (creditHours && (creditHours < 1 || creditHours > 6)) {
      return res.status(400).json({ message: 'Credit hours must be between 1 and 6' });
    }
    
    if (code && code !== subject.code) {
      const existingSubject = await Subject.findOne({ code });
      if (existingSubject && existingSubject._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'A subject with this code already exists' });
      }
    }
    
    if (clos && clos.length > 0) {
      const program = subject.programId;
      
      for (const clo of clos) {
        const ploExists = program.plos.some(plo => plo.number === clo.ploNumber);
        if (!ploExists) {
          return res.status(400).json({ 
            message: `PLO number ${clo.ploNumber} referenced in CLO ${clo.number} does not exist in this program` 
          });
        }
      }
    }
    
    if (name) subject.name = name;
    if (code) subject.code = code;
    if (creditHours) subject.creditHours = creditHours;
    if (isLab !== undefined) subject.isLab = isLab; 
    if (clos) subject.clos = clos;
    
    await subject.save();
    res.status(200).json(subject);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.status(200).json({ message: 'Subject removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addClo = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('programId');
      
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    const { number, passingPercentage, type, description, ploNumber } = req.body;
    
    if (!number || !passingPercentage || !type || !description || !ploNumber) {
      return res.status(400).json({ message: 'All CLO fields are required' });
    }
    
    const cloExists = subject.clos.some(clo => clo.number === number);
    if (cloExists) {
      return res.status(400).json({ message: `CLO number ${number} already exists for this subject` });
    }
    
    const program = subject.programId;
    const ploExists = program.plos.some(plo => plo.number === ploNumber);
    if (!ploExists) {
      return res.status(400).json({ 
        message: `PLO number ${ploNumber} does not exist in the program` 
      });
    }
    
    subject.clos.push({
      number,
      passingPercentage,
      type,
      description,
      ploNumber
    });
    
    await subject.save();
    res.status(200).json(subject);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.removeClo = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    const cloId = req.params.cloId;
    
    const cloIndex = subject.clos.findIndex(clo => clo._id.toString() === cloId);
    if (cloIndex === -1) {
      return res.status(404).json({ message: 'CLO not found' });
    }
    
    subject.clos.splice(cloIndex, 1);
    
    await subject.save();
    res.status(200).json(subject);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};