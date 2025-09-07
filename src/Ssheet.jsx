import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Subjectsheet.css';
import { Download } from 'lucide-react';
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

function StudentSheet({ setcomp }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cloToPloMapping, setCloToPloMapping] = useState({});
  const [cloDetails, setCloDetails] = useState({});
  const [cloFields, setCloFields] = useState({ ...DEFAULT_FIELDS });
  const [studentMarks, setStudentMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState({});
  const [completePLOData, setCompletePLOData] = useState({});

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const startTime = performance.now();
        
        //  PARALLEL API CALLS - All at once!
        await Promise.allSettled([
          fetchCLOtoPLOMapping(),
          fetchStudentMarks(),
          loadCompletePLOData()
        ]);
        
        const endTime = performance.now();
        console.log(`⚡ Total load time: ${(endTime - startTime).toFixed(2)}ms`);
        
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
      const selectedCourseId = localStorage.getItem('selectedCourseId');
      
      if (!selectedCourseId) {
        setDefaultCLOData();
        return;
      }
  
      const response = await axios.get(`/api/cloplo/clo-plo-mapping/${selectedCourseId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5 second timeout
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
      }
    } catch (err) {
      console.warn('CLO mapping failed, using defaults:', err.message);
      setDefaultCLOData();
    }
  };

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
      clo1: { assignment: '100', quiz: '50', mid: '50', final: '100' },
      clo2: { assignment: '100', quiz: '50', mid: '50', final: '100' },
      clo3: { assignment: '100', quiz: '50', mid: '50', final: '100' }
    };

    setCloToPloMapping(defaultCloToPloMapping);
    setCloDetails(defaultCloDetails);
    setCloFields(defaultFields);
    setTotalMarks(defaultTotalMarks);
  };

  const fetchStudentMarks = async () => {
    try {
      const selectedCourseId = localStorage.getItem('selectedCourseId');
      const selectedSemesterId = localStorage.getItem('selectedSemesterId');
      
      if (!selectedCourseId || !selectedSemesterId) {
        throw new Error('No course or semester ID found. Please select a course first.');
      }

      const response = await axios.get(`/api/student-marks/${selectedCourseId}/${selectedSemesterId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      console.log('API Response:', response.data);

      // ✅ FIXED: Handle new response format
      if (response.data.student) {
        // New format: single student object
        const studentData = {
          id: response.data.student.id,
          name: response.data.student.name,
          rollNumber: response.data.student.rollNumber,
          email: response.data.student.email
        };
        setStudent(studentData);

        // Set marks for current student
        if (response.data.studentMarks) {
          console.log('Setting student marks:', response.data.studentMarks);
          setStudentMarks({ [studentData.name]: response.data.studentMarks });
        }

        // Set total marks from API response
        if (response.data.totalMarks) {
          console.log('Setting total marks:', response.data.totalMarks);
          setTotalMarks(response.data.totalMarks);
        }
        
        setError(null);
      } else if (response.data.students && Array.isArray(response.data.students) && response.data.students.length > 0) {
        // Fallback: old format (for backward compatibility)
        const studentName = response.data.students[0];
        const studentData = {
          id: 'current-student',
          name: studentName,
          rollNumber: 'FC-001',
          email: `${studentName.toLowerCase().replace(/\s+/g, '.')}@example.com`
        };
        setStudent(studentData);

        if (response.data.studentMarks && response.data.studentMarks[1]) {
          setStudentMarks({ [studentName]: response.data.studentMarks[1] });
        }

        if (response.data.totalMarks) {
          setTotalMarks(response.data.totalMarks);
        }
        
        setError(null);
      } else {
        throw new Error('No student data found');
      }
    } catch (err) {
      console.error('Error fetching student marks:', err);
      setError(err.message || 'Failed to load student marks. Please try again.');
      
      // Fallback to dummy student with sample marks
      const dummyStudent = {
        id: 'dummy-student',
        name: 'Zabitdummy1',
        rollNumber: 'FC-001',
        email: 'zabitdummy1@example.com'
      };
      setStudent(dummyStudent);
      
      const sampleMarks = {
        clo1: { assignment: '85', quiz: '42', mid: '45', final: '92', kpi: '88%' },
        clo2: { assignment: '78', quiz: '38', mid: '42', final: '85', kpi: '76%' },
        clo3: { assignment: '92', quiz: '48', mid: '47', final: '88', kpi: '84%' }
      };
      
      setStudentMarks({ [dummyStudent.name]: sampleMarks });
    }
  };

  const getFieldWeightage = useCallback((field, clo) => {
    if (!cloFields[clo] || !Array.isArray(cloFields[clo])) {
      return 0;
    }
    
    const fieldConfig = cloFields[clo].find(f => f.name === field);
    return fieldConfig ? fieldConfig.weightage / 100 : 0;
  }, [cloFields]);

  const calculateKPI = useCallback((studentName, clo) => {
    if (!studentName || !studentMarks[studentName] || !studentMarks[studentName][clo]) {
      return '';
    }
    
    const marks = studentMarks[studentName][clo];
    const totals = totalMarks[clo] || {};
    let totalWeighted = 0;

    if (!cloFields[clo] || !Array.isArray(cloFields[clo])) {
      return '';
    }
    
    const fields = cloFields[clo].map(f => f.name);
    
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
  }, [studentMarks, totalMarks, cloFields, getFieldWeightage]);

  const loadCompletePLOData = async () => {
    try {
      if (Object.keys(completePLOData).length > 0) {
        return;
      }

      const selectedSemesterId = localStorage.getItem('selectedSemesterId');
      if (!selectedSemesterId) return;

      const response = await axios.get(`/api/subject-sheets/all-students-plo/${selectedSemesterId}`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5 second timeout
      });

      if (response.data.success) {
        setCompletePLOData(response.data.studentsPLOData);
      }
    } catch (error) {
      console.warn('PLO data loading failed:', error.message);
    }
  };

  const calculatePLOPercentage = useCallback((studentName, ploNumber) => {
    if (Object.keys(completePLOData).length === 0) {
      return '...';
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

  const exportToCSV = () => {
    if (!student) return;

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

    const row = [student.name, student.rollNumber, student.email];

    Object.keys(cloFields).forEach(clo => {
      if (cloFields[clo] && Array.isArray(cloFields[clo])) {
        const marks = studentMarks[student.name] && studentMarks[student.name][clo] ? studentMarks[student.name][clo] : {};
        
        cloFields[clo].forEach(field => {
          row.push(marks[field.name] || '');
        });
        
        const kpiValue = calculateKPI(student.name, clo);
        row.push(kpiValue);
      }
    });

    Object.values(cloToPloMapping).forEach(ploValue => {
      const ploNumber = ploValue.replace('PLO ', '');
      row.push(calculatePLOPercentage(student.name, ploNumber));
    });
    
    csvRows.push(row);

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_marks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCloDisplayName = (clo) => {
    if (cloDetails[clo] && cloDetails[clo].cloNumber) {
      return `CLO ${cloDetails[clo].cloNumber}`;
    }
    return clo.replace(/([a-z])([0-9])/i, '$1 $2').toUpperCase();
  };

  const isPLODataLoading = Object.keys(completePLOData).length === 0;
  const isCLODataLoading = Object.keys(cloToPloMapping).length === 0;

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

  if (!student) {
    return (
      <div className="sheet-container">
        <div className="error-container">
          <p>No student data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet-container">
        <button 
        className="back-botnn"
          onClick={() => setcomp("Scourse")}
        >
          ←
        </button>

      <div className="sheet-wrapper">
        <table className="sheet-table">
            <thead>
              <tr>
              <th className="sheet-sticky-col"></th>
              {isCLODataLoading ? (
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
                      </th>
                    ))}
                    <th className="sheet-header-secondary">KPI</th>
                  </React.Fragment>
                ))
              )}
              
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
                        <div className="sheet-display-value">
                          {totalMarks[cloKey]?.[field.name] || ''}
                        </div>
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
            <tr className="sheet-row-even">
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
                      <div className="sheet-display-value">
                        {studentMarks[student.name]?.[cloKey]?.[field.name] || ''}
                      </div>
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
          </tbody>
        </table>
      </div>
      
      <div className="sheet-actions">
        <button onClick={exportToCSV} className="sheet-action-button">
          <Download size={20} /> Export to CSV
        </button>
      </div>
    </div>
  );
}

export default StudentSheet;