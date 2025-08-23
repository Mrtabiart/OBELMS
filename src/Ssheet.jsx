import React from 'react';
import './Subjectsheet.css';

function StudentSheet({ setcomp }) {
  const students = ["Zabit Mehmood Kahlon", "Jahandad Ahmed", "Mohsin Ali", "Shoaib Hussain", "Muhammad Saad"];
  
  const studentMarks = {
    1: {
      quiz1: 8, quiz2: 7, quiz3: 9,
      assignment1: 15, assignment2: 14, assignment3: 13,
      midterm_q1: 8, midterm_q2: 9,
      final_q1: 18, final_q2: 19, final_q3: 17
    },
  };

  const getQuestionCounts = () => {
    const firstStudent = studentMarks[1] || {};
    return {
      midterm: Object.keys(firstStudent).filter(key => key.startsWith('midterm_q')).length,
      final: Object.keys(firstStudent).filter(key => key.startsWith('final_q')).length
    };
  };

  const { midterm: midtermCount, final: finalCount } = getQuestionCounts();

  const calculateTotal = (studentId) => {
    if (!studentMarks[studentId]) return 0;
    return Object.values(studentMarks[studentId]).reduce((sum, mark) => sum + Number(mark || 0), 0);
  };

  const exportToCSV = () => {
    let csv = ['Student'];
    
    ['Quiz 1', 'Quiz 2', 'Quiz 3'].forEach(quiz => {
      csv.push(quiz);
    });
    
    ['Assignment 1', 'Assignment 2', 'Assignment 3'].forEach(assignment => {
      csv.push(assignment);
    });
    
    Array.from({ length: midtermCount }, (_, i) => i + 1).forEach(num => {
      csv.push(`Midterm Q${num}`);
    });
    
    Array.from({ length: finalCount }, (_, i) => i + 1).forEach(num => {
      csv.push(`Final Q${num}`);
    });
    
    csv.push('Total');
    csv = [csv.join(',')];

    students.forEach((student, index) => {
      const studentId = index + 1;
      let row = [student];
      
      ['quiz1', 'quiz2', 'quiz3'].forEach(quiz => {
        row.push(studentMarks[studentId]?.[quiz] || '');
      });
      
      ['assignment1', 'assignment2', 'assignment3'].forEach(assignment => {
        row.push(studentMarks[studentId]?.[assignment] || '');
      });
      
      Array.from({ length: midtermCount }, (_, i) => i + 1).forEach(num => {
        row.push(studentMarks[studentId]?.[`midterm_q${num}`] || '');
      });
      
      Array.from({ length: finalCount }, (_, i) => i + 1).forEach(num => {
        row.push(studentMarks[studentId]?.[`final_q${num}`] || '');
      });
      
      row.push(calculateTotal(studentId));
      csv.push(row.join(','));
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marks_sheet.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="department-container">
      <div className="student-sheet">
        <button 
          className="back-botn"
          onClick={() => setcomp("Scourse")}
        >
          ←
        </button>
        <h2 className="sheeth2">Student Marks Sheet</h2>

        <div className="generated-sheet">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Quiz 1</th>
                <th>Quiz 2</th>
                <th>Quiz 3</th>
                <th>Assignment 1</th>
                <th>Assignment 2</th>
                <th>Assignment 3</th>
                {Array.from({ length: midtermCount }, (_, i) => (
                  <th key={`midterm-header-${i + 1}`}>Midterm Q{i + 1}</th>
                ))}
                {Array.from({ length: finalCount }, (_, i) => (
                  <th key={`final-header-${i + 1}`}>Final Q{i + 1}</th>
                ))}
                <th className="total-column">Total</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const studentId = index + 1;
                return (
                  <tr key={`student-${studentId}`}>
                    <td style={{ width: "auto", minWidth: "14rem", textAlign: "center" }}>
                      {student}
                    </td>
                    {['quiz1', 'quiz2', 'quiz3'].map((quiz) => (
                      <td key={`${studentId}-${quiz}`} className="excel-cell">
                        {studentMarks[studentId]?.[quiz] || ''}
                      </td>
                    ))}
                    {['assignment1', 'assignment2', 'assignment3'].map((assignment) => (
                      <td key={`${studentId}-${assignment}`} className="excel-cell">
                        {studentMarks[studentId]?.[assignment] || ''}
                      </td>
                    ))}
                    {Array.from({ length: midtermCount }, (_, i) => (
                      <td key={`${studentId}-midterm-${i + 1}`} className="excel-cell">
                        {studentMarks[studentId]?.[`midterm_q${i + 1}`] || ''}
                      </td>
                    ))}
                    {Array.from({ length: finalCount }, (_, i) => (
                      <td key={`${studentId}-final-${i + 1}`} className="excel-cell">
                        {studentMarks[studentId]?.[`final_q${i + 1}`] || ''}
                      </td>
                    ))}
                    <td className="total-column">{calculateTotal(studentId)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="button-group">
          <button className="export-btn" onClick={exportToCSV}>
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentSheet;