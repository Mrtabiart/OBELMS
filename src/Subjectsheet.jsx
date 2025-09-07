import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Subjectsheet.css';
import { Download, Save, PlusCircle, X, Edit3 } from 'lucide-react';
import axios from 'axios';

const DEFAULT_FIELDS = {};

const generateDynamicCLOFields = (cloToPloMapping, currentCloFields = {}) => {
  try {
    const dynamicFields = {};
    const cloKeys = Object.keys(cloToPloMapping || {});
    
    if (cloKeys.length === 0) {
      return {
        clo1: [
          { name: 'assignment', weightage: 33 },
          { name: 'quiz', weightage: 33 },
          { name: 'mid', weightage: 17 },
          { name: 'final', weightage: 17 }
        ],
        clo2: [
          { name: 'assignment', weightage: 33 },
          { name: 'quiz', weightage: 33 },
          { name: 'mid', weightage: 17 },
          { name: 'final', weightage: 17 }
        ],
        clo3: [
          { name: 'assignment', weightage: 33 },
          { name: 'quiz', weightage: 33 },
          { name: 'mid', weightage: 17 },
          { name: 'final', weightage: 17 }
        ]
      };
    }
    
    cloKeys.forEach(cloKey => {
      if (currentCloFields && currentCloFields[cloKey] && currentCloFields[cloKey].length > 0) {
        dynamicFields[cloKey] = [...currentCloFields[cloKey]];
      } else {
        dynamicFields[cloKey] = [
          { name: 'assignment', weightage: 33 },
          { name: 'quiz', weightage: 33 },
          { name: 'mid', weightage: 17 },
          { name: 'final', weightage: 17 }
        ];
      }
    });
    
    return dynamicFields;
  } catch (error) {
    return {
      clo1: [
        { name: 'assignment', weightage: 33 },
        { name: 'quiz', weightage: 33 },
        { name: 'mid', weightage: 17 },
        { name: 'final', weightage: 17 }
      ],
      clo2: [
        { name: 'assignment', weightage: 33 },
        { name: 'quiz', weightage: 33 },
        { name: 'mid', weightage: 17 },
        { name: 'final', weightage: 17 }
      ],
      clo3: [
        { name: 'assignment', weightage: 33 },
        { name: 'quiz', weightage: 33 },
        { name: 'mid', weightage: 17 },
        { name: 'final', weightage: 17 }
      ]
    };
  }
};

function Subjectsheet({ setcomp }) {
  // ✅ UPDATED: Store complete student objects instead of just names
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cloToPloMapping, setCloToPloMapping] = useState({});
  const [cloDetails, setCloDetails] = useState({});
  const [cloFields, setCloFields] = useState({ ...DEFAULT_FIELDS });
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [selectedClo, setSelectedClo] = useState('');
  const [newField, setNewField] = useState({ name: '', weightage: 0 });
  const [tempFields, setTempFields] = useState([]);

  const [studentsMarks, setStudentsMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState({});
  const [disabledColumns, setDisabledColumns] = useState({
    clo1Final: false,
    clo3Mid: false
  });

  // ✅ NEW: State for subject sheet management
  const [currentSheetId, setCurrentSheetId] = useState(null);
  const [isNewSheet, setIsNewSheet] = useState(true);

  // ✅ NEW: State for complete PLO data
  const [completePLOData, setCompletePLOData] = useState({});

  // ✅ ULTRA FAST: Load PLO data in background
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // ✅ OPTIMIZATION: Load CLO-PLO mapping in background too
        fetchCLOtoPLOMapping(); // Don't await this
        
        // Then: Get students (after CLO structure is ready)
        await fetchStudents();
        
        // ✅ NEW: Try to load existing subject sheet
        await loadExistingSubjectSheet();
        
        // ✅ OPTIMIZATION: Load PLO data in background (non-blocking)
        loadCompletePLOData();
        
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false); // ✅ This will show the sheet immediately
      }
    };

    initializeData();
  }, []);

  // ✅ UPDATED: Load existing subject sheet with better debugging
  const loadExistingSubjectSheet = async () => {
    try {
      const semesterId = sessionStorage.getItem('currentSemester');
      const courseId = sessionStorage.getItem('currentCourseId');
      
      console.log('=== LOADING EXISTING SHEET ===');
      console.log('Semester ID:', semesterId);
      console.log('Course ID:', courseId);
      
      if (!semesterId || !courseId) {
        console.log('Missing IDs, skipping load');
        return;
      }

      const response = await axios.get(`/api/subject-sheets/semester/${semesterId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('API Response:', response.data);

      if (response.data.success && response.data.subjectSheets.length > 0) {
        console.log('Found sheets:', response.data.subjectSheets.length);
        
        // Find sheet for current course - check both populated and non-populated courseId
        const currentSheet = response.data.subjectSheets.find(sheet => {
          const sheetCourseId = sheet.courseId._id || sheet.courseId;
          console.log('Comparing:', sheetCourseId, 'with', courseId);
          return sheetCourseId === courseId;
        });

        console.log('Current sheet found:', !!currentSheet);

        if (currentSheet) {
          console.log('Loading sheet data:', currentSheet);
          setCurrentSheetId(currentSheet._id);
          setIsNewSheet(false);
          
          // Load existing data
          if (currentSheet.cloToPloMapping) {
            console.log('Loading CLO-PLO mapping:', currentSheet.cloToPloMapping);
            setCloToPloMapping(currentSheet.cloToPloMapping);
          }
          
          if (currentSheet.cloDetails) {
            console.log('Loading CLO details:', currentSheet.cloDetails);
            setCloDetails(currentSheet.cloDetails);
            
            // Convert cloDetails to cloFields format
            const fieldsFromDetails = {};
            Object.keys(currentSheet.cloDetails).forEach(cloKey => {
              if (currentSheet.cloDetails[cloKey].fields) {
                fieldsFromDetails[cloKey] = currentSheet.cloDetails[cloKey].fields;
              }
            });
            console.log('Converted fields:', fieldsFromDetails);
            setCloFields(fieldsFromDetails);
          }

          if (currentSheet.students && currentSheet.students.length > 0) {
            console.log('Loading students:', currentSheet.students.length);
            
            // Convert students data to our format
            const studentsData = currentSheet.students.map(student => ({
              id: student.studentId,
              name: student.studentName,
              rollNumber: student.rollNumber,
              email: student.email
            }));
            console.log('Converted students:', studentsData);
            setStudents(studentsData);

            // Convert marks data
            const marksData = {};
            currentSheet.students.forEach(student => {
              marksData[student.studentName] = {};
              Object.keys(student.marks).forEach(cloKey => {
                marksData[student.studentName][cloKey] = {
                  ...student.marks[cloKey].fields,
                  kpi: student.marks[cloKey].kpi || ''
                };
              });
            });
            console.log('Converted marks:', marksData);
            setStudentsMarks(marksData);
          }

          // Load total marks
          if (currentSheet.cloDetails) {
            const totalMarksData = {};
            Object.keys(currentSheet.cloDetails).forEach(cloKey => {
              if (currentSheet.cloDetails[cloKey].totalMarks) {
                totalMarksData[cloKey] = currentSheet.cloDetails[cloKey].totalMarks;
              }
            });
            console.log('Loading total marks:', totalMarksData);
            setTotalMarks(totalMarksData);
          }

          const dc = currentSheet.disabledColumns;
          // Handle Mongoose Map or plain object
          const loadedDisabled = dc && typeof dc.toObject === 'function'
            ? dc.toObject()
            : (dc || {});

          setDisabledColumns(prev => ({
            clo1Final: false,
            clo3Mid: false,
            ...loadedDisabled
          }));
        } else {
          console.log('No sheet found for this course');
        }
      } else {
        console.log('No sheets found or API error');
      }
    } catch (error) {
      console.log('Error loading existing sheet:', error.message);
      // This is okay - we'll create a new sheet
    }
  };

  // ✅ UPDATED: Non-blocking CLO-PLO mapping fetch
  const fetchCLOtoPLOMapping = async () => {
    try {
      const courseId = sessionStorage.getItem('currentCourseId');
      
      if (!courseId) {
        // Use defaults immediately
        setDefaultCLOData();
        return;
      }
  
      const response = await axios.get(`/api/cloplo/clo-plo-mapping/${courseId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (response.data.cloToPloMapping) {
        // ✅ ULTRA OPTIMIZATION: Single batch update
        const dynamicFields = generateDynamicCLOFields(response.data.cloToPloMapping, cloFields);
        const dynamicTotalMarks = {};
        
        Object.keys(dynamicFields).forEach(cloKey => {
          dynamicTotalMarks[cloKey] = {};
          dynamicFields[cloKey].forEach(field => {
            dynamicTotalMarks[cloKey][field.name] = '';
          });
        });

        // Single batch update - reduces re-renders from 4 to 1
        setCloToPloMapping(response.data.cloToPloMapping);
        setCloDetails(response.data.cloDetails);
        setCloFields(dynamicFields);
        setTotalMarks(dynamicTotalMarks);
        
        if (!selectedClo && Object.keys(dynamicFields).length > 0) {
          setSelectedClo(Object.keys(dynamicFields)[0]);
        }
      }
    } catch (err) {
      // Use defaults if API fails
      setDefaultCLOData();
    }
  };

  // ✅ NEW: Set default CLO data immediately
  const setDefaultCLOData = () => {
    const defaultCloToPloMapping = {
      clo1: 'PLO 1',
      clo2: 'PLO 2',
      clo3: 'PLO 3'
    };
    
    const defaultCloDetails = {
      clo1: { cloNumber: 1, ploNumber: 1, cloId: 'default_clo1' },
      clo2: { cloNumber: 2, ploNumber: 2, cloId: 'default_clo2' },
      clo3: { cloNumber: 3, ploNumber: 3, cloId: 'default_clo3' }
    };
    
    const defaultFields = generateDynamicCLOFields(defaultCloToPloMapping, {});
    const defaultTotalMarks = {
      clo1: { assignment: '', quiz: '', mid: '', final: '' },
      clo2: { assignment: '', quiz: '', mid: '', final: '' },
      clo3: { assignment: '', quiz: '', mid: '', final: '' }
    };

    // Batch update for defaults
    setCloToPloMapping(defaultCloToPloMapping);
    setCloDetails(defaultCloDetails);
    setCloFields(defaultFields);
    setTotalMarks(defaultTotalMarks);
  };

  const fetchStudents = async () => {
    try {
      const semesterId = sessionStorage.getItem('currentSemester');
      
      if (!semesterId) {
        throw new Error('No semester ID found. Please select a course first.');
      }

      const response = await axios.get(`/api/subject-sheet/semester/${semesterId}/students`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success && Array.isArray(response.data.students)) {
        // ✅ UPDATED: Store complete student objects
        const fetchedStudents = response.data.students.map(student => ({
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email
        }));
        setStudents(fetchedStudents);

        // ✅ OPTIMIZATION: Pre-calculate CLO fields once
        const currentCloFields = Object.keys(cloFields).length > 0 ? cloFields : generateDynamicCLOFields({
          clo1: 'PLO 1',
          clo2: 'PLO 2',
          clo3: 'PLO 3'
        }, {});

        const initialStudentsMarks = fetchedStudents.reduce((acc, student) => {
          const studentMarks = {};
          
          Object.keys(currentCloFields).forEach(cloKey => {
            studentMarks[cloKey] = {};
            currentCloFields[cloKey].forEach(field => {
              studentMarks[cloKey][field.name] = '';
            });
            studentMarks[cloKey].kpi = '';
          });
          
          return { ...acc, [student.name]: studentMarks };
        }, {});

        setStudentsMarks(initialStudentsMarks);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to load students. Please try again.');
      const sampleStudents = [
        { id: '1', name: "Zabit Mehmood Kahlon", rollNumber: "FC-001", email: "zabit@example.com" },
        { id: '2', name: "Jahandad Ahmed", rollNumber: "FC-002", email: "jahandad@example.com" },
        { id: '3', name: "Mohsin Ali", rollNumber: "FC-003", email: "mohsin@example.com" },
        { id: '4', name: "Shoaib Hussain", rollNumber: "FC-004", email: "shoaib@example.com" },
        { id: '5', name: "Muhammad Saad", rollNumber: "FC-005", email: "saad@example.com" }
      ];
      setStudents(sampleStudents);
      
      // ✅ OPTIMIZATION: Reuse CLO fields calculation
      const currentCloFields = Object.keys(cloFields).length > 0 ? cloFields : generateDynamicCLOFields({
        clo1: 'PLO 1',
        clo2: 'PLO 2',
        clo3: 'PLO 3'
      }, {});
      
      const initialStudentsMarks = sampleStudents.reduce((acc, student) => {
        const studentMarks = {};
        
        Object.keys(currentCloFields).forEach(cloKey => {
          studentMarks[cloKey] = {};
          currentCloFields[cloKey].forEach(field => {
            studentMarks[cloKey][field.name] = '';
          });
          studentMarks[cloKey].kpi = '';
        });
        
        return { ...acc, [student.name]: studentMarks };
      }, {});
      
      setStudentsMarks(initialStudentsMarks);
    }
  };
  
  const calculateTotalWeight = () => {
    return tempFields.reduce((sum, field) => sum + (Number(field.weightage) || 0), 0);
  };

  const addField = () => {
    if (newField.name.trim() === '' || !newField.weightage) {
      alert("Please enter both field name and weightage");
      return;
    }
    setTempFields([...tempFields, { ...newField }]);
    setNewField({ name: '', weightage: 0 });
  };

  const removeField = (index) => {
    const updatedFields = [...tempFields];
    updatedFields.splice(index, 1);
    setTempFields(updatedFields);
  };

  const startUpdate = () => {
    setShowUpdatePanel(true);
    const firstCloKey = Object.keys(cloFields)[0];
    if (firstCloKey) {
      setSelectedClo(firstCloKey);
      setTempFields([...cloFields[firstCloKey]]);
    } else {
      setTempFields([]);
    }
  };

  const cancelUpdate = () => {
    setShowUpdatePanel(false);
    setTempFields([]);
  };

  const confirmUpdate = () => {
    if (calculateTotalWeight() !== 100) {
      alert("Total weightage must be exactly 100%");
      return;
    }

    const newMarksStructure = {};
    tempFields.forEach(field => {
      newMarksStructure[field.name] = '';
    });

    const updatedStudentsMarks = { ...studentsMarks };
    students.forEach(student => {
      updatedStudentsMarks[student.name][selectedClo] = {
        ...newMarksStructure,
        kpi: ''
      };
    });

    const updatedTotalMarks = { ...totalMarks };
    updatedTotalMarks[selectedClo] = { ...newMarksStructure };

    const updatedCloFields = { ...cloFields };
    updatedCloFields[selectedClo] = [...tempFields];

    // ✅ OPTIMIZATION: Batch update
    setStudentsMarks(updatedStudentsMarks);
    setTotalMarks(updatedTotalMarks);
    setCloFields(updatedCloFields);
    setShowUpdatePanel(false);

    if (selectedClo === 'clo1') {
      setDisabledColumns(prev => ({
        ...prev,
        clo1Final: false
      }));
    }
    if (selectedClo === 'clo3') {
      setDisabledColumns(prev => ({
        ...prev,
        clo3Mid: false
      }));
    }
  };

  const handleInputChange = (student, clo, field, value) => {
    setStudentsMarks(prev => ({
      ...prev,
      [student]: {
        ...prev[student],
        [clo]: {
          ...prev[student][clo],
          [field]: value
        }
      }
    }));
  };

  const handleTotalMarksChange = (clo, field, value) => {
    setTotalMarks(prev => ({
      ...prev,
      [clo]: {
        ...prev[clo],
        [field]: value
      }
    }));
  };

  const toggleColumn = (column) => {
    setDisabledColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));

    const updatedCloFields = { ...cloFields };
    
    if (column === 'clo1Final') {
      if (!disabledColumns.clo1Final) {
        updatedCloFields.clo1 = updatedCloFields.clo1.map(field => ({
          ...field,
          weightage: field.name === 'mid' ? 34 :
                     field.name === 'final' ? 0 :
                     field.name === 'assignment' || field.name === 'quiz' ? 33 : field.weightage
        }));
      } else {
        updatedCloFields.clo1 = updatedCloFields.clo1.map(field => ({
          ...field,
          weightage: field.name === 'mid' || field.name === 'final' ? 17 :
                     field.name === 'assignment' || field.name === 'quiz' ? 33 : field.weightage
        }));
      }
    } else if (column === 'clo3Mid') {
      if (!disabledColumns.clo3Mid) {
        updatedCloFields.clo3 = updatedCloFields.clo3.map(field => ({
          ...field,
          weightage: field.name === 'final' ? 34 :
                     field.name === 'mid' ? 0 :
                     field.name === 'assignment' || field.name === 'quiz' ? 33 : field.weightage
        }));
      } else {
        updatedCloFields.clo3 = updatedCloFields.clo3.map(field => ({
          ...field,
          weightage: field.name === 'mid' || field.name === 'final' ? 17 :
                     field.name === 'assignment' || field.name === 'quiz' ? 33 : field.weightage
        }));
      }
    }
    
    setCloFields(updatedCloFields);

    if (!disabledColumns[column]) {
      const updatedMarks = { ...studentsMarks };
      students.forEach(student => {
        if (column === 'clo1Final') {
          updatedMarks[student.name].clo1.final = '';
        } else if (column === 'clo3Mid') {
          updatedMarks[student.name].clo3.mid = '';
        }
      });
      setStudentsMarks(updatedMarks);
    }
  };

  // ✅ ULTRA OPTIMIZATION: Memoized getFieldWeightage
  const getFieldWeightage = useCallback((field, clo) => {
    if (!cloFields[clo] || !Array.isArray(cloFields[clo])) {
      return 0;
    }
    
    const fieldConfig = cloFields[clo].find(f => f.name === field);
    return fieldConfig ? fieldConfig.weightage / 100 : 0;
  }, [cloFields]);

  // ✅ ULTRA OPTIMIZATION: Memoized calculateKPI with faster loop
  const calculateKPI = useCallback((student, clo) => {
    if (!student || !studentsMarks[student] || !studentsMarks[student][clo]) {
      return '';
    }
    
    const marks = studentsMarks[student][clo];
    const totals = totalMarks[clo] || {};
    let totalWeighted = 0;

    if (!cloFields[clo] || !Array.isArray(cloFields[clo])) {
      return '';
    }
    
    const fields = cloFields[clo].map(f => f.name);
    
    // ✅ ULTRA OPTIMIZATION: Fastest possible loop
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const obtained = parseFloat(marks[field]) || 0;
      const total = parseFloat(totals[field]) || 1;
      const weightage = getFieldWeightage(field, clo);
      
      if (weightage > 0 && total > 0) {
        totalWeighted += (obtained / total) * weightage * 100;
      }
    }

    const kpiValue = totalWeighted ? Math.round(totalWeighted) : null;
    return kpiValue ? `${kpiValue}%` : '';
  }, [studentsMarks, totalMarks, cloFields, getFieldWeightage]);

  // ✅ ULTRA OPTIMIZATION: Memoized field weightages
  const fieldWeightages = useMemo(() => {
    const weightages = {};
    Object.keys(cloFields).forEach(clo => {
      weightages[clo] = {};
      if (cloFields[clo] && Array.isArray(cloFields[clo])) {
        cloFields[clo].forEach(field => {
          weightages[clo][field.name] = field.weightage / 100;
        });
      }
    });
    return weightages;
  }, [cloFields]);

  // ✅ OPTIMIZATION: Faster PLO loading with caching
  const loadCompletePLOData = async (force = false) => {
    try {
      if (!force && Object.keys(completePLOData).length > 0) {
        console.log('PLO data already loaded, skipping...');
        return;
      }

      const semesterId = sessionStorage.getItem('currentSemester');
      if (!semesterId) return;

      // show loading in PLO columns while refetching
      if (force) setCompletePLOData({});

      const response = await axios.get(`/api/subject-sheets/all-students-plo/${semesterId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data.success) {
        setCompletePLOData(response.data.studentsPLOData);
        console.log('Complete PLO data loaded:', response.data.studentsPLOData);
      }
    } catch (error) {
      console.log('Error loading complete PLO data:', error.message);
    }
  };

  // ✅ NEW: Calculate PLO percentage for a student (from all subjects)
  const calculatePLOPercentage = useCallback((studentName, ploNumber) => {
    // ✅ If PLO data not loaded yet, show loading indicator
    if (Object.keys(completePLOData).length === 0) {
      return '...'; // Show loading indicator
    }

    if (!completePLOData[studentName]) {
      return '';
    }

    const ploData = completePLOData[studentName][`PLO ${ploNumber}`];
    if (!ploData || ploData.validCLOs === 0) {
      return '';
    }

    return `${ploData.percentage}%`;
  }, [completePLOData]);

  // ✅ UPDATED: Export CSV with complete PLO data
  const exportToCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Email'];
    
    Object.keys(cloFields).forEach(clo => {
      if (cloFields[clo] && Array.isArray(cloFields[clo])) {
        cloFields[clo].forEach(field => {
          headers.push(`${clo.toUpperCase()} ${field.name}`);
        });
        headers.push(`${clo.toUpperCase()} KPI`);
      }
    });

    // Add only linked PLO columns
    Object.values(cloToPloMapping).forEach(ploValue => {
      headers.push(ploValue);
    });

    const csvRows = [headers];

    students.forEach(student => {
      const row = [student.name, student.rollNumber, student.email];

      Object.keys(cloFields).forEach(clo => {
        if (cloFields[clo] && Array.isArray(cloFields[clo])) {
          const marks = studentsMarks[student.name] && studentsMarks[student.name][clo] ? studentsMarks[student.name][clo] : {};
          
          cloFields[clo].forEach(field => {
            row.push(marks[field.name] || '');
          });
          
          const kpiValue = calculateKPI(student.name, clo);
          row.push(kpiValue);
        }
      });

      // Add linked PLO percentages (calculated from all subjects)
      Object.values(cloToPloMapping).forEach(ploValue => {
        const ploNumber = ploValue.replace('PLO ', '');
        row.push(calculatePLOPercentage(student.name, ploNumber));
      });
      
      csvRows.push(row);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_marks_with_plo.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ✅ UPDATED: Complete save functionality with KPI calculation
  const saveToDatabase = async () => {
    try {
      const semesterId = sessionStorage.getItem('currentSemester');
      const courseId = sessionStorage.getItem('currentCourseId');
      
      if (!semesterId || !courseId) {
        alert('Missing required IDs. Please select a course first.');
        return;
      }

      // Prepare students data for database with calculated KPIs
      const studentsData = students.map(student => {
        const studentMarks = {};
        
        Object.keys(cloFields).forEach(cloKey => {
          const marks = studentsMarks[student.name]?.[cloKey] || {};
          const calculatedKPI = calculateKPI(student.name, cloKey);
          
          studentMarks[cloKey] = {
            kpi: calculatedKPI,
            fields: Object.keys(marks)
              .filter(key => key !== 'kpi')
              .reduce((fieldAcc, field) => {
                fieldAcc[field] = marks[field] || '';
                return fieldAcc;
              }, {})
          };
        });

        return {
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          marks: studentMarks
        };
      });

      const marksData = {
        semesterId,
        courseId,
        cloToPloMapping,
        cloDetails: Object.keys(cloDetails).reduce((acc, cloKey) => {
          acc[cloKey] = {
            cloKey,
            cloNumber: cloDetails[cloKey].cloNumber,
            ploNumber: cloDetails[cloKey].ploNumber,
            cloId: cloDetails[cloKey].cloId,
            fields: cloFields[cloKey] || [],
            totalMarks: totalMarks[cloKey] || {}
          };
          return acc;
        }, {}),
        students: studentsData,
        disabledColumns // <-- add this
      };

      let response;
      if (isNewSheet) {
        // Create new sheet
        response = await axios.post('/api/subject-sheets', marksData, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
        setCurrentSheetId(response.data.subjectSheet._id);
        setIsNewSheet(false);
      } else {
        // Update existing sheet
        response = await axios.put(`/api/subject-sheets/${currentSheetId}`, marksData, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (response.data.success) {
        alert('Subject sheet saved successfully!');
        await loadCompletePLOData(true); // force refresh PLOs immediately
      } else {
        throw new Error(response.data.message || 'Failed to save');
      }
      
    } catch (err) {
      console.error('Save error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to save marks. Please try again.');
    }
  };
  
  const getCloDisplayName = (clo) => {
    if (cloDetails[clo] && cloDetails[clo].cloNumber) {
      return `CLO ${cloDetails[clo].cloNumber}`;
    }
    return clo.replace(/([a-z])([0-9])/i, '$1 $2').toUpperCase();
  };

  // ✅ NEW: Show loading state for PLO columns
  const isPLODataLoading = Object.keys(completePLOData).length === 0;

  // ✅ NEW: Show loading state for CLO data
  const isCLODataLoading = Object.keys(cloToPloMapping).length === 0;

  // ✅ UPDATED: Loading states with NUML animation
  if (loading) {
    return (
      <div className="sheet-container">
        <div className="numl-loading-container">
          <div className="numl-loader">
            <span className="numl-letter">N</span>
            <span className="numl-letter">U</span>
            <span className="numl-letter">M</span>
            <span className="numl-letter">L</span>
          </div>
          {/* <div className="loading-text">Loading...</div> */}
        </div>
      </div>
    );
  }

  if (Object.keys(cloFields).length === 0) {
    return (
      <div className="sheet-container">
        <div className="numl-loading-container">
          <div className="numl-loader">
            <span className="numl-letter">N</span>
            <span className="numl-letter">U</span>
            <span className="numl-letter">M</span>
            <span className="numl-letter">L</span>
          </div>
          <div className="loading-text">Preparing Sheet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet-container">
      <button 
        className="back-botnn"
        onClick={() => setcomp("Tcourse")}
      >
        ←
      </button>

      {showUpdatePanel && (
        <div className="update-panel">
          <div className="update-panel-header">
            <h2>Update CLO Structure</h2>
            <button className="close-button" onClick={cancelUpdate}>
              <X size={18} />
            </button>
          </div>

          <div className="update-selector">
            <label htmlFor="clo-select">Choose the CLO you want to update:</label>
            <select 
              id="clo-select"
              value={selectedClo}
              onChange={(e) => {
                setSelectedClo(e.target.value);
                setTempFields([...cloFields[e.target.value]]);
              }}
              className="clo-select"
            >
              {Object.entries(cloDetails).map(([cloKey, cloDetail]) => {
                return (
                  <option key={cloKey} value={cloKey}>
                    CLO {cloDetail.cloNumber}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="field-adder">
            <div className="field-inputs">
              <input
                type="text"
                placeholder="Field Name"
                value={newField.name}
                onChange={(e) => setNewField({...newField, name: e.target.value})}
                className="field-input"
              />
              <input
                type="number"
                placeholder="Weightage (%)"
                value={newField.weightage || ''}
                onChange={(e) => setNewField({...newField, weightage: parseInt(e.target.value, 10) || 0})}
                className="field-input"
                min="1"
                max="100"
              />
              <button 
                className="add-field-button"
                onClick={addField}
              >
                <PlusCircle size={16} /> Add
              </button>
            </div>
          </div>

          <div className="field-list">
            <h3>Fields for {getCloDisplayName(selectedClo)}</h3>
            {tempFields.length > 0 ? (
              <ul>
                {tempFields.map((field, index) => (
                  <li key={index} className="field-item">
                    <span className="field-name">{field.name}</span>
                    <span className="field-weightage">{field.weightage}%</span>
                    <button 
                      className="remove-field-button"
                      onClick={() => removeField(index)}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No fields added yet. Add fields to update the CLO structure.</p>
            )}
            
            <div className={`total-weight ${calculateTotalWeight() === 100 ? 'weight-valid' : 'weight-invalid'}`}>
              Total Weight: {calculateTotalWeight()}%
              {calculateTotalWeight() !== 100 && (
                <span className="weight-warning">
                  {calculateTotalWeight() > 100 ? 
                    "Total weight cannot exceed 100%" : 
                    "Total weight must equal exactly 100%"}
                </span>
              )}
            </div>
            
            <button 
              className="confirm-update-button"
              onClick={confirmUpdate}
              disabled={calculateTotalWeight() !== 100 || tempFields.length === 0}
            >
              Confirm Update
            </button>
          </div>
        </div>
      )}

      <div className="sheet-wrapper">
        <table className="sheet-table">
          <thead>
            <tr>
              <th className="sheet-sticky-col"></th>
              {isCLODataLoading ? (
                // Show loading state for CLO headers
                <th colSpan={4} className="sheet-header-primary">
                  <span style={{ color: '#fff', fontSize: '14px' }}>Loading CLOs...</span>
                </th>
              ) : (
                Object.entries(cloDetails).map(([cloKey, cloDetail]) => {
                  return (
                    <th 
                      key={cloKey} 
                      colSpan={cloFields[cloKey]?.length + 1 || 5} 
                      className="sheet-header-primary"
                    >
                      CLO {cloDetail.cloNumber}
                    </th>
                  );
                })
              )}
              <th colSpan={Object.keys(cloToPloMapping).length} className="sheet-header-primary plo-header">
                PLOs (All Subjects)
              </th>
            </tr>
            <tr>
              <th className="sheet-sticky-col"></th>
              {isCLODataLoading ? (
                // Show loading state for field headers
                <th colSpan={4} className="sheet-header-secondary">
                  <span style={{ color: '#fff', fontSize: '12px' }}>Loading fields...</span>
                </th>
              ) : (
                Object.entries(cloDetails).map(([cloKey, cloDetail]) => (
                  <React.Fragment key={`headers-${cloKey}`}>
                    {cloFields[cloKey]?.map(field => (
                      <th key={`${cloKey}-${field.name}`} className="sheet-header-secondary">
                        {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                        <div className="sheet-percentage">
                          ({field.weightage}%)
                        </div>
                        
                        {cloKey === 'clo1' && field.name === 'final' && (
                          <button
                            onClick={() => toggleColumn('clo1Final')}
                            className={`sheet-notification ${disabledColumns.clo1Final ? 'sheet-notification-disabled' : 'sheet-notification-enabled'}`}
                          >
                            {disabledColumns.clo1Final ? '✕' : '✓'}
                          </button>
                        )}
                        {cloKey === 'clo3' && field.name === 'mid' && (
                          <button
                            onClick={() => toggleColumn('clo3Mid')}
                            className={`sheet-notification ${disabledColumns.clo3Mid ? 'sheet-notification-disabled' : 'sheet-notification-enabled'}`}
                          >
                            {disabledColumns.clo3Mid ? '✕' : '✓'}
                          </button>
                        )}
                      </th>
                    ))}
                    <th className="sheet-header-secondary">KPI</th>
                  </React.Fragment>
                ))
              )}
              
              {/* ✅ UPDATED: Show only linked PLOs */}
              {Object.entries(cloToPloMapping).map(([cloKey, ploValue]) => (
                <th key={cloKey} className="sheet-header-secondary">{ploValue}</th>
              ))}
            </tr>
            <tr className='totalinputsheet'>
              <td className="sheet-sticky-col sheet-row-even sheet-text-bold">Total Marks</td>
              {isCLODataLoading ? (
                <td colSpan={4} className="sheet-cell sheet-row-even">
                  <span style={{ color: '#666', fontSize: '12px' }}>Loading...</span>
                </td>
              ) : (
                Object.entries(cloDetails).map(([cloKey, cloDetail]) => (
                  <React.Fragment key={`total-${cloKey}`}>
                    {cloFields[cloKey]?.map(field => (
                      <td key={`total-${cloKey}-${field.name}`} className="sheet-cell sheet-row-even">
                        <input 
                          type="number" 
                          min="1" 
                          className="sheet-input" 
                          value={totalMarks[cloKey]?.[field.name] || ''}
                          onChange={(e) => handleTotalMarksChange(cloKey, field.name, e.target.value)}
                          disabled={
                            (cloKey === 'clo1' && field.name === 'final' && disabledColumns.clo1Final) ||
                            (cloKey === 'clo3' && field.name === 'mid' && disabledColumns.clo3Mid)
                          }
                        />
                      </td>
                    ))}
                    <td className="sheet-cell sheet-row-even"></td>
                  </React.Fragment>
                ))
              )}
              {Object.entries(cloToPloMapping).map(([cloKey, cloDetail]) => (
                <td key={`plo-total-${cloKey}`} className="sheet-cell sheet-row-even"></td>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className={index % 2 === 0 ? 'sheet-row-even' : 'sheet-row-odd'}>
                <td className="sheet-sticky-col sheet-text-bold">
                  <div>
                    <div className="student-name">{student.name}</div>
                    <div className="student-roll">{student.rollNumber}</div>
                    <div className="student-email">{student.email}</div>
                  </div>
                </td>
                {Object.entries(cloDetails).map(([cloKey, cloDetail]) => (
                  <React.Fragment key={`${student.id}-${cloKey}`}>
                    {cloFields[cloKey]?.map(field => (
                      <td key={`${student.id}-${cloKey}-${field.name}`} className="sheet-cell">
                        <input
                          type="number"
                          min="0"
                          value={studentsMarks[student.name]?.[cloKey]?.[field.name] || ''}
                          onChange={(e) => handleInputChange(student.name, cloKey, field.name, e.target.value)}
                          className="sheet-input"
                          disabled={
                            (cloKey === 'clo1' && field.name === 'final' && disabledColumns.clo1Final) ||
                            (cloKey === 'clo3' && field.name === 'mid' && disabledColumns.clo3Mid)
                          }
                        />
                      </td>
                    ))}
                    <td className="sheet-cell sheet-cell-center sheet-text-bold">
                      {calculateKPI(student.name, cloKey)}
                    </td>
                  </React.Fragment>
                ))}
                
                {/* ✅ UPDATED: Show linked PLOs with complete calculation */}
                {Object.entries(cloToPloMapping).map(([cloKey, ploValue]) => {
                  const ploNumber = ploValue.replace('PLO ', '');
                  return (
                    <td key={cloKey} className="sheet-cell sheet-cell-center sheet-text-bold plo-cell">
                      {isPLODataLoading ? (
                        <span style={{ color: '#666', fontSize: '12px' }}>Loading...</span>
                      ) : (
                        calculatePLOPercentage(student.name, ploNumber)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sheet-actions">
        <button onClick={exportToCSV} className="sheet-action-button">
          <Download size={20} /> Export to CSV
        </button>
        <button onClick={saveToDatabase} className="sheet-action-button">
          <Save size={20} /> {isNewSheet ? 'Save Sheet' : 'Update Sheet'}
        </button>
        <button onClick={startUpdate} className="sheet-action-button">
          <Edit3 size={20} /> Update Structure
        </button>
      </div>
    </div>
  );
}

export default Subjectsheet;