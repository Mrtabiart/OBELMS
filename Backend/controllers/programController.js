const Program = require('../models/programModel');
const Department = require('../models/departmentModel');

exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(programs);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getProgramsByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    
    
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const programs = await Program.find({ departmentId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(programs);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid department ID' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('departmentId', 'name hodName');
      
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    res.status(200).json(program);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.createProgram = async (req, res) => {
  const { name, coordinatorName, departmentId, plos } = req.body;
  
  try {
    
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    
    const program = new Program({
      name,
      coordinatorName,
      departmentId,
      plos: plos || []
    });
    
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.updateProgram = async (req, res) => {
  const { name, coordinatorName, plos } = req.body;
  
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    

    if (name) program.name = name;
    if (coordinatorName) program.coordinatorName = coordinatorName;
    if (plos) program.plos = plos;
    
    await program.save();
    res.status(200).json(program);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    res.status(200).json({ message: 'Program removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};