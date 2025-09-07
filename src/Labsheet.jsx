import React, { useState, useEffect, useCallback } from 'react';
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
          { name: 'Lab 1', weightage: 0 },
          { name: 'Lab 2', weightage: 0 },
          { name: 'Lab 3', weightage: 0 },
          { name: 'Lab 4', weightage: 0 },
          { name: 'Project/OpenendedLab', weightage: 0 },
          { name: 'Final Lab', weightage: 0 }
        ],
        clo2: [
          { name: 'Lab 1', weightage: 0 },
          { name: 'Lab 2', weightage: 0 },
          { name: 'Lab 3', weightage: 0 },
          { name: 'Lab 4', weightage: 0 },
          { name: 'Project/OpenendedLab', weightage: 0 },
          { name: 'Final Lab', weightage: 0 }
        ],
        clo3: [
          { name: 'Lab 1', weightage: 0 },
          { name: 'Lab 2', weightage: 0 },
          { name: 'Lab 3', weightage: 0 },
          { name: 'Lab 4', weightage: 0 },
          { name: 'Project/OpenendedLab', weightage: 0 },
          { name: 'Final Lab', weightage: 0 }
        ]
      };
    }
    
    cloKeys.forEach(cloKey => {
      if (currentCloFields && currentCloFields[cloKey] && currentCloFields[cloKey].length > 0) {
        dynamicFields[cloKey] = [...currentCloFields[cloKey]];
      } else {
        dynamicFields[cloKey] = [
          { name: 'Lab 1', weightage: 0 },
          { name: 'Lab 2', weightage: 0 },
          { name: 'Lab 3', weightage: 0 },
          { name: 'Lab 4', weightage: 0 },
          { name: 'Project/OpenendedLab', weightage: 0 },
          { name: 'Final Lab', weightage: 0 }
        ];
      }
    });
    
    return dynamicFields;
  } catch (error) {
    return {
      clo1: [
        { name: 'Lab 1', weightage: 0 },
        { name: 'Lab 2', weightage: 0 },
        { name: 'Lab 3', weightage: 0 },
        { name: 'Lab 4', weightage: 0 },
        { name: 'Project/OpenendedLab', weightage: 0 },
        { name: 'Final Lab', weightage: 0 }
      ],
      clo2: [
        { name: 'Lab 1', weightage: 0 },
        { name: 'Lab 2', weightage: 0 },
        { name: 'Lab 3', weightage: 0 },
        { name: 'Lab 4', weightage: 0 },
        { name: 'Project/OpenendedLab', weightage: 0 },
        { name: 'Final Lab', weightage: 0 }
      ],
      clo3: [
        { name: 'Lab 1', weightage: 0 },
        { name: 'Lab 2', weightage: 0 },
        { name: 'Lab 3', weightage: 0 },
        { name: 'Lab 4', weightage: 0 },
        { name: 'Project/OpenendedLab', weightage: 0 },
        { name: 'Final Lab', weightage: 0 }
      ]
    };
  }
};

function Labsheet({ setcomp }) {
  // Store complete student objects like Subjectsheet
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cloToPloMapping, setCloToPloMapping] = useState({});
  const [cloDetails, setCloDetails] = useState({});
  const [cloFields, setCloFields] = useState({ ...DEFAULT_FIELDS });
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [selectedClo, setSelectedClo] = useState('');
  const [newField, setNewField] = useState({ name: '' });
  const [tempFields, setTempFields] = useState([]);

  const [studentsMarks, setStudentsMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState({});

  // Track sheet like Subjectsheet
  const [currentSheetId, setCurrentSheetId] = useState(null);
  const [isNewSheet, setIsNewSheet] = useState(true);

  const [completePLOData, setCompletePLOData] = useState({});
  const isPLODataLoading = Object.keys(completePLOData).length === 0;

  // Initialize like Subjectsheet
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await fetchCLOtoPLOMapping();
        await fetchStudents();
        await loadExistingSubjectSheet(); // reuse same API & model
        loadCompletePLOData();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchCLOtoPLOMapping = async () => {
    try {
      const courseId = sessionStorage.getItem('currentCourseId');
      
      if (!courseId) {
        throw new Error('No course ID found. Please select a course first.');
      }
  
      const response = await axios.get(`/api/cloplo/clo-plo-mapping/${courseId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (response.data.cloToPloMapping) {
        const dynamicFields = generateDynamicCLOFields(response.data.cloToPloMapping, cloFields);
        const dynamicTotalMarks = {};
        
        Object.keys(dynamicFields).forEach(cloKey => {
          dynamicTotalMarks[cloKey] = {};
          dynamicFields[cloKey].forEach(field => {
            dynamicTotalMarks[cloKey][field.name] = '';
          });
        });

        setCloToPloMapping(response.data.cloToPloMapping);
        setCloDetails(response.data.cloDetails);
        setCloFields(dynamicFields);
        setTotalMarks(dynamicTotalMarks);
        
        if (!selectedClo && Object.keys(dynamicFields).length > 0) {
          setSelectedClo(Object.keys(dynamicFields)[0]);
        }
      }
    } catch (err) {
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
      
      const defaultFields = generateDynamicCLOFields(defaultCloToPloMapping, cloFields);
      const defaultTotalMarks = {
        clo1: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '' },
        clo2: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '' },
        clo3: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '' }
      };

      setCloToPloMapping(defaultCloToPloMapping);
      setCloDetails(defaultCloDetails);
      setCloFields(defaultFields);
      setTotalMarks(defaultTotalMarks);
    }
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
        // Expect objects like Subjectsheet
        const fetchedStudents = response.data.students.map(student => ({
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email
        }));
        setStudents(fetchedStudents);

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

  // Load existing sheet like Subjectsheet
  const loadExistingSubjectSheet = async () => {
    try {
      const semesterId = sessionStorage.getItem('currentSemester');
      const courseId = sessionStorage.getItem('currentCourseId');
      
      if (!semesterId || !courseId) {
        return;
      }

      const response = await axios.get(`/api/subject-sheets/semester/${semesterId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success && response.data.subjectSheets.length > 0) {
        const currentSheet = response.data.subjectSheets.find(sheet => {
          const sheetCourseId = sheet.courseId?._id || sheet.courseId;
          return sheetCourseId === courseId;
        });

        if (currentSheet) {
          setCurrentSheetId(currentSheet._id);
          setIsNewSheet(false);
          
          if (currentSheet.cloToPloMapping) {
            setCloToPloMapping(currentSheet.cloToPloMapping);
          }
          
          if (currentSheet.cloDetails) {
            setCloDetails(currentSheet.cloDetails);
            const fieldsFromDetails = {};
            Object.keys(currentSheet.cloDetails).forEach(cloKey => {
              if (currentSheet.cloDetails[cloKey].fields) {
                fieldsFromDetails[cloKey] = currentSheet.cloDetails[cloKey].fields;
              }
            });
            setCloFields(fieldsFromDetails);
          }

          // ✅ FIXED: DON'T override students from subject sheet
          // Students should ALWAYS come from semester collection
          // Only load marks data if students exist in the sheet
          if (currentSheet.students && currentSheet.students.length > 0) {
            console.log('Loading marks data for existing students');
            
            // Convert marks data - merge with existing students marks
            setStudentsMarks(prevMarks => {
              const newMarksData = { ...prevMarks };
              
              currentSheet.students.forEach(student => {
                if (newMarksData[student.studentName]) {
                  // Student exists, update their marks
                  Object.keys(student.marks).forEach(cloKey => {
                    newMarksData[student.studentName][cloKey] = {
                      ...newMarksData[student.studentName][cloKey], // Keep existing structure
                      ...student.marks[cloKey].fields,
                      kpi: student.marks[cloKey].kpi || ''
                    };
                  });
                }
                // If student doesn't exist in current list, ignore (they're from semester)
              });
              
              console.log('Merged marks:', newMarksData);
              return newMarksData;
            });
          }

          if (currentSheet.cloDetails) {
            const totalMarksData = {};
            Object.keys(currentSheet.cloDetails).forEach(cloKey => {
              if (currentSheet.cloDetails[cloKey].totalMarks) {
                totalMarksData[cloKey] = currentSheet.cloDetails[cloKey].totalMarks;
              }
            });
            setTotalMarks(totalMarksData);
          }
        }
      }
    } catch (error) {
      // OK to ignore; new sheet can be created
    }
  };

  const loadCompletePLOData = async (force = false) => {
    try {
      if (!force && Object.keys(completePLOData).length > 0) return;
      const semesterId = sessionStorage.getItem('currentSemester');
      if (!semesterId) return;
      // show loading while refetching
      if (force) setCompletePLOData({});
      const response = await axios.get(`/api/subject-sheets/all-students-plo/${semesterId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      if (response.data.success) {
        setCompletePLOData(response.data.studentsPLOData);
      }
    } catch (e) {}
  };

  const addField = () => {
    if (newField.name.trim() === '') {
      alert("Please enter a field name");
      return;
    }
    setTempFields([...tempFields, { ...newField }]);
    setNewField({ name: '' });
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
    updatedCloFields[selectedClo] = tempFields.map(f => ({
      name: f.name,
      weightage: Number.isFinite(f.weightage) ? f.weightage : 0
    }));

    setStudentsMarks(updatedStudentsMarks);
    setTotalMarks(updatedTotalMarks);
    setCloFields(updatedCloFields);
    setShowUpdatePanel(false);
  };

  // ✅ FIXED: Add null check in handleInputChange
  const handleInputChange = (student, clo, field, value) => {
    setStudentsMarks(prev => ({
      ...prev,
      [student]: {
        ...prev[student],
        [clo]: {
          ...(prev[student]?.[clo] || {}), // ✅ FIXED: Add null check
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

  const calculateKPI = useCallback((student, clo) => {
    if (!student || !studentsMarks[student] || !studentsMarks[student][clo]) {
      return '';
    }
    
    const marks = studentsMarks[student][clo];
    const totals = totalMarks[clo] || {};
    
    let totalObtained = 0;
    let totalMaximum = 0;

    if (!cloFields[clo] || !Array.isArray(cloFields[clo])) {
      return '';
    }
    
    const fields = cloFields[clo].map(f => f.name);
    
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const obtained = parseFloat(marks[field]) || 0;
      const total = parseFloat(totals[field]) || 0;
      
      totalObtained += obtained;
      totalMaximum += total;
    }

    if (totalMaximum === 0) return '';
    
    const percentage = (totalObtained / totalMaximum) * 100;
    return percentage ? `${Math.round(percentage)}%` : '';
  }, [studentsMarks, totalMarks, cloFields]);

  const calculatePLOPercentage = useCallback((studentName, ploNumber) => {
    if (Object.keys(completePLOData).length === 0) return '...';
    if (!completePLOData[studentName]) return '';
    const ploData = completePLOData[studentName][`PLO ${ploNumber}`];
    if (!ploData || ploData.validCLOs === 0) return '';
    return `${ploData.percentage}%`;
  }, [completePLOData]);

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

      // append cross-subject PLOs once
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
    a.download = 'lab_sheet_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Save or update using same API/shape as Subjectsheet
  const saveToDatabase = async () => {
    try {
      const semesterId = sessionStorage.getItem('currentSemester');
      const courseId = sessionStorage.getItem('currentCourseId');
      
      if (!semesterId || !courseId) {
        alert('Missing required IDs. Please select a course first.');
        return;
      }

      const studentsData = students.map(student => {
        const studentMarksByClo = {};
        Object.keys(cloFields).forEach(cloKey => {
          const marks = studentsMarks[student.name]?.[cloKey] || {};
          const calculatedKPI = calculateKPI(student.name, cloKey);
          studentMarksByClo[cloKey] = {
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
          marks: studentMarksByClo
        };
      });

      const normalizedCloFields = Object.fromEntries(
        Object.entries(cloFields).map(([k, arr]) => [k, (arr || []).map(f => ({ name: f.name, weightage: Number.isFinite(f.weightage) ? f.weightage : 0 }))])
      );

      const payload = {
        semesterId,
        courseId,
        cloToPloMapping,
        cloDetails: Object.keys(cloDetails).reduce((acc, cloKey) => {
          acc[cloKey] = {
            cloKey,
            cloNumber: cloDetails[cloKey].cloNumber,
            ploNumber: cloDetails[cloKey].ploNumber,
            cloId: cloDetails[cloKey].cloId,
            fields: normalizedCloFields[cloKey] || [],
            totalMarks: totalMarks[cloKey] || {}
          };
          return acc;
        }, {}),
        students: studentsData
      };

      let response;
      if (isNewSheet) {
        response = await axios.post('/api/subject-sheets', payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
        setCurrentSheetId(response.data.subjectSheet._id);
        setIsNewSheet(false);
      } else {
        response = await axios.put(`/api/subject-sheets/${currentSheetId}`, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (response.data.success) {
        alert('Lab sheet saved successfully!');
        await loadCompletePLOData(true); // refresh PLOs immediately
      } else {
        throw new Error(response.data.message || 'Failed to save');
      }
      
    } catch (err) {
      console.error('Error saving lab sheet data:', err);
      alert(err.response?.data?.message || err.message || 'Failed to save data. Please try again.');
    }
  };

  const getCloDisplayName = (clo) => {
    if (cloDetails[clo] && cloDetails[clo].cloNumber) {
      return `CLO ${cloDetails[clo].cloNumber}`;
    }
    return clo.replace(/([a-z])([0-9])/i, '$1 $2').toUpperCase();
  };

  if (loading) {
    return <div className="loading">Loading students data...</div>;
  }

  if (Object.keys(cloFields).length === 0) {
    return <div className="loading">Loading CLO structure...</div>;
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
            <h2>Update Lab Sheet Structure</h2>
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
            
            <button 
              className="confirm-update-button"
              onClick={confirmUpdate}
              disabled={tempFields.length === 0}
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
              {Object.entries(cloDetails).map(([cloKey, cloDetail]) => {
                return (
                  <th 
                    key={cloKey} 
                    colSpan={cloFields[cloKey]?.length + 1 || 7} 
                    className="sheet-header-primary"
                  >
                    CLO {cloDetail.cloNumber}
                  </th>
                );
              })}
              <th colSpan={Object.keys(cloToPloMapping).length} className="sheet-header-primary plo-header">PLO's</th>
            </tr>
            <tr>
              <th className="sheet-sticky-col"></th>
              {Object.entries(cloDetails).map(([cloKey, cloDetail]) => (
                <React.Fragment key={`headers-${cloKey}`}>
                  {cloFields[cloKey]?.map(field => (
                    <th key={`${cloKey}-${field.name}`} className="sheet-header-secondary">
                      {field.name}
                    </th>
                  ))}
                  <th className="sheet-header-secondary">KPI</th>
                </React.Fragment>
              ))}
              {Object.entries(cloToPloMapping).map(([cloKey, ploValue]) => (
                <th key={cloKey} className="sheet-header-secondary">{ploValue}</th>
              ))}
            </tr>
            <tr className='totalinputsheet'>
              <td className="sheet-sticky-col sheet-row-even sheet-text-bold">Total Marks</td>
              {Object.entries(cloDetails).map(([cloKey, cloDetail]) => (
                <React.Fragment key={`total-${cloKey}`}>
                  {cloFields[cloKey]?.map(field => (
                    <td key={`total-${cloKey}-${field.name}`} className="sheet-cell sheet-row-even">
                      <input 
                        type="number" 
                        min="1" 
                        className="sheet-input" 
                        value={totalMarks[cloKey]?.[field.name] || ''}
                        onChange={(e) => handleTotalMarksChange(cloKey, field.name, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="sheet-cell sheet-row-even"></td>
                </React.Fragment>
              ))}
              {Object.entries(cloToPloMapping).map(([cloKey, cloDetail]) => (
                <td key={`plo-total-${cloKey}`} className="sheet-cell sheet-row-even"></td>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id || student.name} className={index % 2 === 0 ? 'sheet-row-even' : 'sheet-row-odd'}>
                <td className="sheet-sticky-col sheet-text-bold">
                  <div>
                    <div className="student-name">{student.name}</div>
                    {student.rollNumber ? <div className="student-roll">{student.rollNumber}</div> : null}
                    {student.email ? <div className="student-email">{student.email}</div> : null}
                  </div>
                </td>
                {Object.entries(cloDetails).map(([cloKey, cloDetail]) => (
                  <React.Fragment key={`${(student.id || student.name)}-${cloKey}`}>
                    {cloFields[cloKey]?.map(field => (
                      <td key={`${(student.id || student.name)}-${cloKey}-${field.name}`} className="sheet-cell">
                        <input
                          type="number"
                          min="0"
                          value={studentsMarks[student.name]?.[cloKey]?.[field.name] || ''}
                          onChange={(e) => handleInputChange(student.name, cloKey, field.name, e.target.value)}
                          className="sheet-input"
                        />
                      </td>
                    ))}
                    <td className="sheet-cell sheet-cell-center sheet-text-bold">
                      {calculateKPI(student.name, cloKey)}
                    </td>
                  </React.Fragment>
                ))}
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
          <Edit3 size={20} /> Update Sheet
        </button>
      </div>
    </div>
  );
}

export default Labsheet;