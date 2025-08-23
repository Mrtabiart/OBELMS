// const Student = require('../models/studentModel');

// // Get all students
// exports.getAllStudents = async (req, res) => {
//   try {
//     const students = await Student.find().sort({ rollNumber: 1 });
//     res.status(200).json(students);
//   } catch (error) {
//     console.error('Error fetching students:', error);
//     res.status(500).json({ message: 'Failed to fetch students' });
//   }
// };

// // Add a new student
// exports.addStudent = async (req, res) => {
//   try {
//     const { name, rollNumber, email } = req.body;
    
//     // Check if student with same roll number or email already exists
//     const existingStudent = await Student.findOne({
//       $or: [{ rollNumber }, { email }]
//     });
    
//     if (existingStudent) {
//       return res.status(400).json({ 
//         message: 'Student with this roll number or email already exists' 
//       });
//     }
    
//     const newStudent = new Student({
//       name,
//       rollNumber,
//       email
//     });
    
//     const savedStudent = await newStudent.save();
//     res.status(201).json(savedStudent);
//   } catch (error) {
//     console.error('Error adding student:', error);
//     res.status(500).json({ message: 'Failed to add student' });
//   }
// };

// // Delete a student
// exports.deleteStudent = async (req, res) => {
//   try {
//     const student = await Student.findByIdAndDelete(req.params.id);
    
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }
    
//     res.status(200).json({ message: 'Student deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting student:', error);
//     res.status(500).json({ message: 'Failed to delete student' });
//   }
// };

// // Bulk add students from CSV
// exports.bulkAddStudents = async (req, res) => {
//   try {
//     const { students } = req.body;
    
//     console.log("Bulk upload request received");
//     console.log("Request body:", JSON.stringify(req.body));
//     console.log(`Number of students in request: ${students ? students.length : 0}`);
    
//     if (!students || !Array.isArray(students) || students.length === 0) {
//       return res.status(400).json({ message: 'No valid student data provided' });
//     }
    
//     // Check if each student has the required fields and keep only valid ones
//     const validStudents = [];
//     for (const student of students) {
//       if (student && student.name && student.rollNumber && student.email) {
//         validStudents.push({
//           name: student.name.trim(),
//           rollNumber: student.rollNumber.trim(),
//           email: student.email.trim()
//         });
//       }
//     }
    
//     console.log(`Number of valid students after validation: ${validStudents.length}`);
    
//     if (validStudents.length === 0) {
//       return res.status(400).json({ message: 'No valid student data provided after validation' });
//     }
    
//     // Create a set of existing roll numbers and emails to check against
//     const existingStudents = await Student.find({
//       $or: [
//         { rollNumber: { $in: validStudents.map(s => s.rollNumber) } },
//         { email: { $in: validStudents.map(s => s.email) } }
//       ]
//     });
    
//     console.log(`Found ${existingStudents.length} existing students that match roll numbers or emails`);
    
//     const existingRollSet = new Set(existingStudents.map(s => s.rollNumber));
//     const existingEmailSet = new Set(existingStudents.map(s => s.email));
    
//     // Filter out students that already exist in the database
//     const newStudents = validStudents.filter(
//       student => !existingRollSet.has(student.rollNumber) && !existingEmailSet.has(student.email)
//     );
    
//     console.log(`Number of new students to add: ${newStudents.length}`);
    
//     if (newStudents.length === 0) {
//       return res.status(400).json({ message: 'All students already exist in the database' });
//     }
    
//     // Create and save all the new students
//     const createdStudents = await Student.insertMany(newStudents);
    
//     console.log(`Successfully added ${createdStudents.length} students to the database`);
    
//     res.status(201).json({
//       message: `Successfully added ${createdStudents.length} students`,
//       students: createdStudents
//     });
//   } catch (error) {
//     console.error('Error in bulkAddStudents:', error);
//     res.status(500).json({ message: 'Failed to add students in bulk: ' + error.message });
//   }
// };

const Student = require('../models/studentModel');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ rollNumber: 1 });
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { name, rollNumber, email } = req.body;

    const existingStudent = await Student.findOne({ rollNumber });

    if (existingStudent) {
      return res.status(400).json({
        message: 'Student with this roll number already exists'
      });
    }

    const newStudent = new Student({
      name,
      rollNumber,
      email
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Failed to add student' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
};

exports.bulkAddStudents = async (req, res) => {
  try {
    const { students } = req.body;

    console.log("Bulk upload request received");
    console.log("Request body:", JSON.stringify(req.body));
    console.log(`Number of students in request: ${students ? students.length : 0}`);

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No valid student data provided' });
    }

    const validStudents = [];
    for (const student of students) {
      if (student && student.name && student.rollNumber && student.email) {
        validStudents.push({
          name: student.name.trim(),
          rollNumber: student.rollNumber.trim(),
          email: student.email.trim()
        });
      }
    }

    console.log(`Number of valid students after validation: ${validStudents.length}`);

    if (validStudents.length === 0) {
      return res.status(400).json({ message: 'No valid student data provided after validation' });
    }

   
    const existingStudents = await Student.find({
      rollNumber: { $in: validStudents.map(s => s.rollNumber) }
    });

    console.log(`Found ${existingStudents.length} existing students with duplicate roll numbers`);

    const existingRollSet = new Set(existingStudents.map(s => s.rollNumber));

    
    const newStudents = validStudents.filter(
      student => !existingRollSet.has(student.rollNumber)
    );

    console.log(`Number of new students to add: ${newStudents.length}`);

    if (newStudents.length === 0) {
      return res.status(400).json({ message: 'All students already exist in the database (duplicate roll numbers)' });
    }

   
    const createdStudents = await Student.insertMany(newStudents);

    console.log(`Successfully added ${createdStudents.length} students to the database`);

    res.status(201).json({
      message: `Successfully added ${createdStudents.length} students`,
      students: createdStudents
    });
  } catch (error) {
    console.error('Error in bulkAddStudents:', error);
    res.status(500).json({ message: 'Failed to add students in bulk: ' + error.message });
  }
};
