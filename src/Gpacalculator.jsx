import React, { useState } from 'react';
import './gpacalculator.css';

function Gpacalculator({ setcomp }) {
  const [activeTab, setActiveTab] = useState('sgpa');
  const [subjects, setSubjects] = useState([
    { name: '', marks: '', creditHours: '' }
  ]);
  const [semesters, setSemesters] = useState([
    { semesterName: 'Semester 1', sgpa: '', creditHours: '' }
  ]);
  const [sgpa, setSgpa] = useState(null);
  const [cgpa, setCgpa] = useState(null);
  const [error, setError] = useState(null);

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value
    };
    setSubjects(updatedSubjects);
  };

  const handleSemesterChange = (index, field, value) => {
    const updatedSemesters = [...semesters];
    updatedSemesters[index] = {
      ...updatedSemesters[index],
      [field]: value
    };
    setSemesters(updatedSemesters);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: '', marks: '', creditHours: '' }]);
  };

  const addSemester = () => {
    const newSemesterNumber = semesters.length + 1;
    setSemesters([
      ...semesters,
      { semesterName: `Semester ${newSemesterNumber}`, sgpa: '', creditHours: '' }
    ]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const removeSemester = (index) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter((_, i) => i !== index));
    }
  };

  const marksToGradePoints = (marks) => {
    if (marks >= 80) return 4.0;
    if (marks >= 75) return 3.7;
    if (marks >= 70) return 3.3;
    if (marks >= 65) return 3.0;
    if (marks >= 60) return 2.7;
    if (marks >= 55) return 2.3;
    if (marks >= 50) return 2.0;
    if (marks >= 45) return 1.7;
    if (marks >= 40) return 1.3;
    if (marks >= 35) return 1.0;
    return 0.0;
  };

  const calculateSGPA = () => {
    for (const subject of subjects) {
      if (!subject.name.trim()) {
        setError('Please enter all subject names');
        return;
      }
      
      if (!subject.marks || parseFloat(subject.marks) < 0 || parseFloat(subject.marks) > 100) {
        setError('Marks should be between 0 and 100');
        return;
      }
      
      if (!subject.creditHours || parseFloat(subject.creditHours) <= 0) {
        setError('Credit hours should be greater than 0');
        return;
      }
    }

    let totalCreditHours = 0;
    let totalGradePoints = 0;

    subjects.forEach(subject => {
      const marks = parseFloat(subject.marks);
      const creditHours = parseFloat(subject.creditHours);
      
      if (!isNaN(marks) && !isNaN(creditHours) && creditHours > 0) {
        const gradePoints = marksToGradePoints(marks);
        totalGradePoints += gradePoints * creditHours;
        totalCreditHours += creditHours;
      }
    });

    setError(null);
    setSgpa(totalCreditHours === 0 ? 0 : totalGradePoints / totalCreditHours);
  };

  const calculateCGPA = () => {
    for (const semester of semesters) {
      const sgpaValue = parseFloat(semester.sgpa);
      if (!semester.sgpa || isNaN(sgpaValue) || sgpaValue < 0 || sgpaValue > 4) {
        setError('SGPA should be between 0 and 4');
        return;
      }
      
      if (!semester.creditHours || parseFloat(semester.creditHours) <= 0) {
        setError('Credit hours should be greater than 0');
        return;
      }
    }

    let totalCreditHours = 0;
    let totalGradePoints = 0;

    semesters.forEach(semester => {
      const sgpa = parseFloat(semester.sgpa);
      const creditHours = parseFloat(semester.creditHours);
      
      if (!isNaN(sgpa) && !isNaN(creditHours) && creditHours > 0) {
        totalGradePoints += sgpa * creditHours;
        totalCreditHours += creditHours;
      }
    });

    setError(null);
    setCgpa(totalCreditHours === 0 ? 0 : totalGradePoints / totalCreditHours);
  };

  const getGradeDescription = (gpa) => {
    if (gpa >= 3.7) return 'Excellent';
    if (gpa >= 3.3) return 'Very Good';
    if (gpa >= 3.0) return 'Good';
    if (gpa >= 2.7) return 'Satisfactory';
    if (gpa >= 2.0) return 'Average';
    if (gpa >= 1.0) return 'Below Average';
    return 'Poor';
  };

  return (
    
    <div className="gpacal-container">
        <button 
          className="back-botn"
          onClick={() => setcomp("Sdashboard")}
        >
          ←
        </button>
      <header className="gpacal-header">
        <h1>GPA Calculator</h1>
        <div className="gpacal-tab-container">
          <button
            className={`gpacal-tab-button ${activeTab === 'sgpa' ? 'active' : ''}`}
            onClick={() => setActiveTab('sgpa')}
          >
            SGPA
          </button>
          <button
            className={`gpacal-tab-button ${activeTab === 'cgpa' ? 'active' : ''}`}
            onClick={() => setActiveTab('cgpa')}
          >
            CGPA
          </button>
        </div>
      </header>

      <div className="gpacal-card">
        {activeTab === 'sgpa' ? (
          <>
            <h2>Semester GPA Calculator</h2>
            <div className="gpacal-form">
              <div className="gpacal-grid-header">
                <span>Subject Name</span>
                <span>Marks </span>
                <span>Credit Hours</span>
              </div>
              
              {subjects.map((subject, index) => (
                <div className="gpacal-grid" key={index}>
                  <input
                    type="text"
                    placeholder="Subject Name"
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Marks"
                    value={subject.marks}
                    onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                    min="0"
                    max="100"
                  />
                  <input
                    type="number"
                    placeholder="Credit Hours"
                    value={subject.creditHours}
                    onChange={(e) => handleSubjectChange(index, 'creditHours', e.target.value)}
                    min="0"
                    step="0.5"
                  />
                  <button 
                    className="gpacal-remove-button"
                    onClick={() => removeSubject(index)}
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="gpacal-button-group">
                <button className="gpacal-add-button" onClick={addSubject}>
                  Add Subject
                </button>
                <button className="gpacal-calculate-button" onClick={calculateSGPA}>
                  Calculate SGPA
                </button>
              </div>

              {error && <div className="gpacal-error">{error}</div>}
              
              {sgpa !== null && (
                <div className="gpacal-results">
                  <div className="gpacal-result-display">
                    <div className="gpacal-value">{sgpa.toFixed(2)}</div>
                    <div className="gpacal-label">SGPA</div>
                  </div>
                  <div className="gpacal-grade">
                    {getGradeDescription(sgpa)}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2>Cumulative GPA Calculator</h2>
            <div className="gpacal-form">
              <div className="gpacal-grid-header">
                <span>Semester</span>
                <span>SGPA (0-4)</span>
                <span>Credit Hours</span>
              </div>

              {semesters.map((semester, index) => (
                <div className="gpacal-grid" key={index}>
                  <input
                    type="text"
                    value={semester.semesterName}
                    onChange={(e) => handleSemesterChange(index, 'semesterName', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="SGPA"
                    value={semester.sgpa}
                    onChange={(e) => handleSemesterChange(index, 'sgpa', e.target.value)}
                    min="0"
                    max="4"
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Credit Hours"
                    value={semester.creditHours}
                    onChange={(e) => handleSemesterChange(index, 'creditHours', e.target.value)}
                    min="0"
                    step="0.5"
                  />
                  <button 
                    className="gpacal-remove-button"
                    onClick={() => removeSemester(index)}
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="gpacal-button-group">
                <button className="gpacal-add-button" onClick={addSemester}>
                  Add Semester
                </button>
                <button className="gpacal-calculate-button" onClick={calculateCGPA}>
                  Calculate CGPA
                </button>
              </div>

              {error && <div className="gpacal-error">{error}</div>}
              
              {cgpa !== null && (
                <div className="gpacal-results">
                  <div className="gpacal-result-display">
                    <div className="gpacal-value">{cgpa.toFixed(2)}</div>
                    <div className="gpacal-label">CGPA</div>
                  </div>
                  <div className="gpacal-grade">
                    {getGradeDescription(cgpa)}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Gpacalculator;