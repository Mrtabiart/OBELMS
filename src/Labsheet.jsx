import React, { useState, useEffect } from 'react';
import { Download, Save, PlusCircle, X, Edit3 } from 'lucide-react';
import axios from 'axios';

const cloToPloMapping = {
  clo1: 'PLO 1',
  clo2: 'PLO 2',
  clo3: 'PLO 3'
};

const DEFAULT_FIELDS = {
  clo1: [
    { name: 'Lab 1' },
    { name: 'Lab 2' },
    { name: 'Lab 3' },
    { name: 'Lab 4' },
    { name: 'Project/OpenendedLab' },
    { name: 'Final Lab' }
  ],
  clo2: [
    { name: 'Lab 1' },
    { name: 'Lab 2' },
    { name: 'Lab 3' },
    { name: 'Lab 4' },
    { name: 'Project/OpenendedLab' },
    { name: 'Final Lab' }
  ],
  clo3: [
    { name: 'Lab 1' },
    { name: 'Lab 2' },
    { name: 'Lab 3' },
    { name: 'Lab 4' },
    { name: 'Project/OpenendedLab' },
    { name: 'Final Lab' }
  ]
};

function Labsheet({ setcomp }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cloFields, setCloFields] = useState({ ...DEFAULT_FIELDS });
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [selectedClo, setSelectedClo] = useState('clo1');
  const [newField, setNewField] = useState({ name: '' });
  const [tempFields, setTempFields] = useState([]);

  const [studentsMarks, setStudentsMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState({
    clo1: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '' },
    clo2: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '' },
    clo3: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '' }
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
              clo1: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '', kpi: '' },
              clo2: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '', kpi: '' },
              clo3: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '', kpi: '' },
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
            clo1: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '', kpi: '' },
            clo2: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '', kpi: '' },
            clo3: { 'Lab 1': '', 'Lab 2': '', 'Lab 3': '', 'Lab 4': '', 'Project/OpenendedLab': '', 'Final Lab': '', kpi: '' },
          }
        }), {});
        
        setStudentsMarks(initialStudentsMarks);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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
    setTempFields([...cloFields[selectedClo]]);
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

  const calculateKPI = (student, clo) => {
    if (!student || !studentsMarks[student] || !studentsMarks[student][clo]) {
      return '';
    }
    
    const marks = studentsMarks[student][clo];
    const totals = totalMarks[clo];
    
    let totalObtained = 0;
    let totalMaximum = 0;

    const fields = cloFields[clo].map(f => f.name);
    
    fields.forEach(field => {
      const obtained = parseFloat(marks[field]) || 0;
      const total = parseFloat(totals[field]) || 0;
      
      totalObtained += obtained;
      totalMaximum += total;
    });

    if (totalMaximum === 0) return '';
    
    const percentage = (totalObtained / totalMaximum) * 100;
    return percentage ? `${Math.round(percentage)}%` : '';
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
    a.download = 'lab_sheet_data.csv';
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
      
      const labSheetData = {
        semesterId,
        cloFields,
        totalMarks,
        studentsMarks
      };
      
      console.log('Saving to database:', labSheetData);
      alert('Save functionality is currently in development.');
      
    } catch (err) {
      console.error('Error saving lab sheet data:', err);
      alert(err.message || 'Failed to save data. Please try again.');
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
                      {field.name}
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

export default Labsheet;