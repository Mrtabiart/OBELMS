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

  // ✅ ULTRA OPTIMIZATION: Single useEffect with sequential execution
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // First: Get CLO-PLO mapping
        await fetchCLOtoPLOMapping();
        
        // Then: Get students (after CLO structure is ready)
        await fetchStudents();
        
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
      // ✅ OPTIMIZATION: Batch update for defaults too
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
        clo1: { assignment: '', quiz: '', mid: '', final: '' },
        clo2: { assignment: '', quiz: '', mid: '', final: '' },
        clo3: { assignment: '', quiz: '', mid: '', final: '' }
      };

      // Batch update for defaults
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
        const fetchedStudents = response.data.students.map(student => student.name);
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
          
          return { ...acc, [student]: studentMarks };
        }, {});

        setStudentsMarks(initialStudentsMarks);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to load students. Please try again.');
      const sampleStudents = ["Zabit Mehmood Kahlon", "Jahandad Ahmed", "Mohsin Ali", "Shoaib Hussain", "Muhammad Saad"];
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
        
        return { ...acc, [student]: studentMarks };
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
      updatedStudentsMarks[student][selectedClo] = {
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
          updatedMarks[student].clo1.final = '';
        } else if (column === 'clo3Mid') {
          updatedMarks[student].clo3.mid = '';
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

  const exportToCSV = () => {
    const headers = ['Student Name'];
    
    Object.keys(cloFields).forEach(clo => {
      if (cloFields[clo] && Array.isArray(cloFields[clo])) {
        cloFields[clo].forEach(field => {
          headers.push(`${clo.toUpperCase()} ${field.name}`);
        });
        headers.push(`${clo.toUpperCase()} KPI`);
      }
    });

    headers.push('PLO 1', 'PLO 2', 'PLO 3');

    const csvRows = [headers];

    students.forEach(student => {
      const row = [student];
      const ploValues = { 'PLO 1': '', 'PLO 2': '', 'PLO 3': '' };

      Object.keys(cloFields).forEach(clo => {
        if (cloFields[clo] && Array.isArray(cloFields[clo])) {
          const marks = studentsMarks[student] && studentsMarks[student][clo] ? studentsMarks[student][clo] : {};
          
          cloFields[clo].forEach(field => {
            row.push(marks[field.name] || '');
          });
          
          const kpiValue = calculateKPI(student, clo);
          row.push(kpiValue);

          if (kpiValue) {
            const plo = cloToPloMapping[clo];
            if (plo) {
              ploValues[plo] = kpiValue;
            }
          }
        }
      });

      row.push(ploValues['PLO 1'], ploValues['PLO 2'], ploValues['PLO 3']);
      csvRows.push(row);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_marks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const saveToDatabase = async () => {
    try {
      const semesterId = sessionStorage.getItem('currentSemester');
      
      if (!semesterId) {
        alert('No semester ID found. Please select a course first.');
        return;
      }
      
      const marksData = {
        semesterId,
        cloFields,
        totalMarks,
        studentsMarks,
        cloToPloMapping
      };
      
      alert('Save functionality is currently in development.');
      
    } catch (err) {
      alert(err.message || 'Failed to save marks. Please try again.');
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
              {Object.entries(cloDetails).map(([cloKey, cloDetail]) => {
                return (
                  <th 
                    key={cloKey} 
                    colSpan={cloFields[cloKey]?.length + 1 || 5} 
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
                        disabled={
                          (cloKey === 'clo1' && field.name === 'final' && disabledColumns.clo1Final) ||
                          (cloKey === 'clo3' && field.name === 'mid' && disabledColumns.clo3Mid)
                        }
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
              <tr key={student} className={index % 2 === 0 ? 'sheet-row-even' : 'sheet-row-odd'}>
                <td className="sheet-sticky-col sheet-text-bold">{student}</td>
                {Object.entries(cloDetails).map(([cloKey, cloDetail]) => (
                  <React.Fragment key={`${student}-${cloKey}`}>
                    {cloFields[cloKey]?.map(field => (
                      <td key={`${student}-${cloKey}-${field.name}`} className="sheet-cell">
                        <input
                          type="number"
                          min="0"
                          value={studentsMarks[student]?.[cloKey]?.[field.name] || ''}
                          onChange={(e) => handleInputChange(student, cloKey, field.name, e.target.value)}
                          className="sheet-input"
                          disabled={
                            (cloKey === 'clo1' && field.name === 'final' && disabledColumns.clo1Final) ||
                            (cloKey === 'clo3' && field.name === 'mid' && disabledColumns.clo3Mid)
                          }
                        />
                      </td>
                    ))}
                    <td className="sheet-cell sheet-cell-center sheet-text-bold">
                      {calculateKPI(student, cloKey)}
                    </td>
                  </React.Fragment>
                ))}
                {Object.entries(cloToPloMapping).map(([cloKey, ploValue]) => (
                  <td key={cloKey} className="sheet-cell sheet-cell-center sheet-text-bold plo-cell">
                    {calculateKPI(student, cloKey)}
                  </td>
                ))}
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
          <Save size={20} /> Save Sheet
        </button>
        <button onClick={startUpdate} className="sheet-action-button">
          <Edit3 size={20} /> Update Sheet
        </button>
      </div>
    </div>
  );
}

export default Subjectsheet;