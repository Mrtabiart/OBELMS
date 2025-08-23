import React, { useState, useEffect } from 'react';
import './Subjectsheet.css';
import { Download, Save, PlusCircle, X, Edit3 } from 'lucide-react';
import axios from 'axios';

const cloToPloMapping = {
  clo1: 'PLO 1',
  clo2: 'PLO 2',
  clo3: 'PLO 3'
};

const DEFAULT_FIELDS = {
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

function Subjectsheet({ setcomp }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cloFields, setCloFields] = useState({ ...DEFAULT_FIELDS });
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [selectedClo, setSelectedClo] = useState('clo1');
  const [newField, setNewField] = useState({ name: '', weightage: 0 });
  const [tempFields, setTempFields] = useState([]);

  const [studentsMarks, setStudentsMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState({
    clo1: { assignment: '', quiz: '', mid: '', final: '' },
    clo2: { assignment: '', quiz: '', mid: '', final: '' },
    clo3: { assignment: '', quiz: '', mid: '', final: '' }
  });

  const [disabledColumns, setDisabledColumns] = useState({
    clo1Final: false,
    clo3Mid: false
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
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

          const initialStudentsMarks = fetchedStudents.reduce((acc, student) => ({
            ...acc,
            [student]: {
              clo1: { assignment: '', quiz: '', mid: '', final: '', kpi: '' },
              clo2: { assignment: '', quiz: '', mid: '', final: '', kpi: '' },
              clo3: { assignment: '', quiz: '', mid: '', final: '', kpi: '' },
            }
          }), {});

          setStudentsMarks(initialStudentsMarks);
          setError(null);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.message || 'Failed to load students. Please try again.');
        const sampleStudents = ["Zabit Mehmood Kahlon", "Jahandad Ahmed", "Mohsin Ali", "Shoaib Hussain", "Muhammad Saad"];
        setStudents(sampleStudents);
        
        const initialStudentsMarks = sampleStudents.reduce((acc, student) => ({
          ...acc,
          [student]: {
            clo1: { assignment: '', quiz: '', mid: '', final: '', kpi: '' },
            clo2: { assignment: '', quiz: '', mid: '', final: '', kpi: '' },
            clo3: { assignment: '', quiz: '', mid: '', final: '', kpi: '' },
          }
        }), {});
        
        setStudentsMarks(initialStudentsMarks);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);
  
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
    setTempFields([...cloFields[selectedClo]]);
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
      const [clo, field] = column === 'clo1Final' ? ['clo1', 'final'] : ['clo3', 'mid'];
      const updatedMarks = { ...studentsMarks };
      students.forEach(student => {
        updatedMarks[student][clo][field] = '';
      });
      setStudentsMarks(updatedMarks);
    }
  };

  const getFieldWeightage = (field, clo) => {
    const fieldConfig = cloFields[clo].find(f => f.name === field);
    return fieldConfig ? fieldConfig.weightage / 100 : 0;
  };

  const calculateKPI = (student, clo) => {
    if (!student || !studentsMarks[student] || !studentsMarks[student][clo]) {
      return '';
    }
    
    const marks = studentsMarks[student][clo];
    const totals = totalMarks[clo];
    let totalWeighted = 0;

    const fields = cloFields[clo].map(f => f.name);
    
    fields.forEach(field => {
      const obtained = parseFloat(marks[field]) || 0;
      const total = parseFloat(totals[field]) || 1;
      const weightage = getFieldWeightage(field, clo);
      
      if (weightage > 0 && total > 0) {
        totalWeighted += (obtained / total) * weightage * 100;
      }
    });

    const kpiValue = totalWeighted ? Math.round(totalWeighted) : null;
    return kpiValue ? `${kpiValue}%` : '';
  };

  const exportToCSV = () => {
    const headers = ['Student Name'];
    
    Object.keys(cloFields).forEach(clo => {
      cloFields[clo].forEach(field => {
        headers.push(`${clo.toUpperCase()} ${field.name}`);
      });
      headers.push(`${clo.toUpperCase()} KPI`);
    });

    headers.push('PLO 1', 'PLO 2', 'PLO 3');

    const csvRows = [headers];

    students.forEach(student => {
      const row = [student];
      const ploValues = { 'PLO 1': '', 'PLO 2': '', 'PLO 3': '' };

      Object.keys(cloFields).forEach(clo => {
        const marks = studentsMarks[student] && studentsMarks[student][clo] ? studentsMarks[student][clo] : {};
        
        cloFields[clo].forEach(field => {
          row.push(marks[field.name] || '');
        });
        
        const kpiValue = calculateKPI(student, clo);
        row.push(kpiValue);

        if (kpiValue) {
          const plo = cloToPloMapping[clo];
          ploValues[plo] = kpiValue;
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
        studentsMarks
      };
      
      console.log('Saving to database:', marksData);
      alert('Save functionality is currently in development.');
      
      
    } catch (err) {
      console.error('Error saving marks:', err);
      alert(err.message || 'Failed to save marks. Please try again.');
    }
  };
  
  const getCloDisplayName = (clo) => {
    return clo.replace(/([a-z])([0-9])/i, '$1 $2').toUpperCase();
  };

  if (loading) {
    return <div className="loading">Loading students data...</div>;
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
              <option value="clo1">CLO 1</option>
              <option value="clo2">CLO 2</option>
              <option value="clo3">CLO 3</option>
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
              {Object.keys(cloFields).map(clo => (
                <th 
                  key={clo} 
                  colSpan={cloFields[clo].length + 1} 
                  className="sheet-header-primary"
                >
                  {getCloDisplayName(clo)}
                </th>
              ))}
              <th colSpan={3} className="sheet-header-primary plo-header">PLO</th>
            </tr>
            <tr>
              <th className="sheet-sticky-col"></th>
              {Object.entries(cloFields).map(([clo, fields]) => (
                <React.Fragment key={`headers-${clo}`}>
                  {fields.map(field => (
                    <th key={`${clo}-${field.name}`} className="sheet-header-secondary">
                      {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                      <div className="sheet-percentage">
                        ({field.weightage}%)
                      </div>
                      
                      {clo === 'clo1' && field.name === 'final' && (
                        <button
                          onClick={() => toggleColumn('clo1Final')}
                          className={`sheet-notification ${disabledColumns.clo1Final ? 'sheet-notification-disabled' : 'sheet-notification-enabled'}`}
                        >
                          {disabledColumns.clo1Final ? '✕' : '✓'}
                        </button>
                      )}
                      {clo === 'clo3' && field.name === 'mid' && (
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
              <th className="sheet-header-secondary">PLO 1</th>
              <th className="sheet-header-secondary">PLO 2</th>
              <th className="sheet-header-secondary">PLO 3</th>
            </tr>
            <tr className='totalinputsheet'>
              <td className="sheet-sticky-col sheet-row-even sheet-text-bold">Total Marks</td>
              {Object.entries(cloFields).map(([clo, fields]) => (
                <React.Fragment key={`total-${clo}`}>
                  {fields.map(field => (
                    <td key={`total-${clo}-${field.name}`} className="sheet-cell sheet-row-even">
                      <input 
                        type="number" 
                        min="1" 
                        className="sheet-input" 
                        value={totalMarks[clo][field.name] || ''}
                        onChange={(e) => handleTotalMarksChange(clo, field.name, e.target.value)}
                        disabled={
                          (clo === 'clo1' && field.name === 'final' && disabledColumns.clo1Final) ||
                          (clo === 'clo3' && field.name === 'mid' && disabledColumns.clo3Mid)
                        }
                      />
                    </td>
                  ))}
                  <td className="sheet-cell sheet-row-even"></td>
                </React.Fragment>
              ))}
              <td className="sheet-cell sheet-row-even"></td>
              <td className="sheet-cell sheet-row-even"></td>
              <td className="sheet-cell sheet-row-even"></td>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student} className={index % 2 === 0 ? 'sheet-row-even' : 'sheet-row-odd'}>
                <td className="sheet-sticky-col sheet-text-bold">{student}</td>
                {Object.entries(cloFields).map(([clo, fields]) => (
                  <React.Fragment key={`${student}-${clo}`}>
                    {fields.map(field => (
                      <td key={`${student}-${clo}-${field.name}`} className="sheet-cell">
                        <input
                          type="number"
                          min="0"
                          value={studentsMarks[student]?.[clo]?.[field.name] || ''}
                          onChange={(e) => handleInputChange(student, clo, field.name, e.target.value)}
                          className="sheet-input"
                          disabled={
                            (clo === 'clo1' && field.name === 'final' && disabledColumns.clo1Final) ||
                            (clo === 'clo3' && field.name === 'mid' && disabledColumns.clo3Mid)
                          }
                        />
                      </td>
                    ))}
                    <td className="sheet-cell sheet-cell-center sheet-text-bold">
                      {calculateKPI(student, clo)}
                    </td>
                  </React.Fragment>
                ))}
                <td className="sheet-cell sheet-cell-center sheet-text-bold plo-cell">
                  {calculateKPI(student, 'clo1')}
                </td>
                <td className="sheet-cell sheet-cell-center sheet-text-bold plo-cell">
                  {calculateKPI(student, 'clo2')}
                </td>
                <td className="sheet-cell sheet-cell-center sheet-text-bold plo-cell">
                  {calculateKPI(student, 'clo3')}
                </td>
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