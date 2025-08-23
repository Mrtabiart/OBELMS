import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Trash2, Edit, ChevronDown, ChevronUp, Plus, Upload, UserPlus, X, Eye, EyeOff, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import './Semester.css';
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function Semester({ setcomp }) {
  const [semesters, setSemesters] = useState([]);
  const [newSemester, setNewSemester] = useState({
    startDate: '',
    endDate: '',
    session: ''
  });
  const [expandedSemester, setExpandedSemester] = useState(null);
  const [courses, setCourses] = useState({});
  const [newCourse, setNewCourse] = useState({
    subjectId: '',
    teacherId: ''
  });
  const [students, setStudents] = useState({});
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    rollNumber: '',
    name: '',
    email: ''
  });
  const [activeSemesterId, setActiveSemesterId] = useState(null);
  const [hideStudents, setHideStudents] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [programId, setProgramId] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const currentProgramId = sessionStorage.getItem("currentProgramId");
        if (!currentProgramId) {
          setErrorMessage('No program ID found in session storage');
          setShowErrorPopup(true);
          setIsLoading(false);
          return;
        }

        setProgramId(currentProgramId);

        // Fetch teachers, subjects, and semesters in parallel
        const [teachersResponse, subjectsResponse, semestersResponse] = await Promise.allSettled([
          axios.get(`${API_URL}/teachers/program/${currentProgramId}`),
          axios.get(`${API_URL}/subjects/program/${currentProgramId}`),
          axios.get(`${API_URL}/semesters/program/${currentProgramId}`)
        ]);

        // Handle teachers response
        if (teachersResponse.status === 'fulfilled') {
          setTeachers(teachersResponse.value.data);
        } else {
          console.error("Error fetching teachers:", teachersResponse.reason);
          setErrorMessage('Error fetching teachers');
          setShowErrorPopup(true);
        }

        // Handle subjects response
        if (subjectsResponse.status === 'fulfilled') {
          setSubjects(subjectsResponse.value.data);
        } else {
          console.error("Error fetching subjects:", subjectsResponse.reason);
          setErrorMessage('Error fetching subjects');
          setShowErrorPopup(true);
        }

        // Handle semesters response
        if (semestersResponse.status === 'fulfilled') {
          const semestersData = semestersResponse.value.data;
          setSemesters(semestersData);
          
          const coursesObj = {};
          const studentsObj = {};
          const hideStudentsObj = {};
          
          semestersData.forEach(semester => {
            coursesObj[semester._id] = semester.courses || [];
            studentsObj[semester._id] = semester.students || [];
            hideStudentsObj[semester._id] = true;
          });
          
          setCourses(coursesObj);
          setStudents(studentsObj);
          setHideStudents(hideStudentsObj);
        } else {
          console.error("Error fetching semesters:", semestersResponse.reason);
          setErrorMessage('Error fetching semesters');
          setShowErrorPopup(true);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error in fetchData:", err);
        setErrorMessage('Error initializing data');
        setShowErrorPopup(true);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
      setSuccessMessage('');
    }, 5000);
  };

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const semesterData = {
        programId,
        ...newSemester
      };
      
      const response = await axios.post(`${API_URL}/semesters`, semesterData);
      const newSemesterData = response.data;
      
      setSemesters([...semesters, newSemesterData]);
      setCourses({ ...courses, [newSemesterData._id]: [] });
      setStudents({ ...students, [newSemesterData._id]: [] });
      setHideStudents({ ...hideStudents, [newSemesterData._id]: true });
      
      setNewSemester({ startDate: '', endDate: '', session: '' });
      showSuccess('Semester created successfully');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error creating semester:", err);
      setErrorMessage(err.response?.data?.message || 'Error creating semester');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  const handleDeleteSemester = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/semesters/${id}`);

      setSemesters(semesters.filter(sem => sem._id !== id));
      
      const newCourses = { ...courses };
      const newStudents = { ...students };
      const newHideStudents = { ...hideStudents };
      
      delete newCourses[id];
      delete newStudents[id];
      delete newHideStudents[id];
      
      setCourses(newCourses);
      setStudents(newStudents);
      setHideStudents(newHideStudents);
      
      showSuccess('Semester deleted successfully');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error deleting semester:", err);
      setErrorMessage(err.response?.data?.message || 'Error deleting semester');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  const handleUpdateSemester = async (id) => {
    try {
      if (!newSemester.startDate || !newSemester.endDate || !newSemester.session) {
        setErrorMessage('All fields are required');
        setShowErrorPopup(true);
        return;
      }

      setIsLoading(true);
      
      const response = await axios.put(`${API_URL}/semesters/${id}`, newSemester);
      const updatedSemester = response.data;
      
      setSemesters(semesters.map(sem => 
        sem._id === id ? updatedSemester : sem
      ));
      
      setNewSemester({ startDate: '', endDate: '', session: '' });
      showSuccess('Semester updated successfully');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error updating semester:", err);
      setErrorMessage(err.response?.data?.message || 'Error updating semester');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  const toggleSemesterView = (id) => {
    setExpandedSemester(expandedSemester === id ? null : id);
    setActiveSemesterId(id);
  };

  const toggleStudentsView = (semesterId) => {
    setHideStudents(prev => ({
      ...prev,
      [semesterId]: !prev[semesterId]
    }));
  };

  const handleAddCourse = async (semesterId) => {
    if (!newCourse.subjectId || !newCourse.teacherId) {
      setErrorMessage('Both subject and teacher are required');
      setShowErrorPopup(true);
      return;
    }

    const subjectExists = subjects.some(subject => subject._id === newCourse.subjectId);

    if (!subjectExists) {
      setErrorMessage('This subject does not exist in the program');
      setShowErrorPopup(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_URL}/semesters/${semesterId}/courses`, newCourse);
      const updatedSemester = response.data;
      
      // Update both the courses state and semesters state
      setCourses({
        ...courses,
        [semesterId]: updatedSemester.courses
      });
      
      setSemesters(semesters.map(sem => 
        sem._id === semesterId ? updatedSemester : sem
      ));
      
      setNewCourse({ subjectId: '', teacherId: '' });
      showSuccess('Course added successfully');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error adding course:", err);
      setErrorMessage(err.response?.data?.message || 'Error adding course');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (semesterId, courseId) => {
    try {
      setIsLoading(true);

      const response = await axios.delete(`${API_URL}/semesters/${semesterId}/courses/${courseId}`);
      const updatedSemester = response.data.semester;
      
      // Update both the courses state and semesters state
      setCourses({
        ...courses,
        [semesterId]: updatedSemester.courses
      });
      
      setSemesters(semesters.map(sem => 
        sem._id === semesterId ? updatedSemester : sem
      ));
      
      showSuccess('Course removed successfully');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error removing course:", err);
      setErrorMessage(err.response?.data?.message || 'Error removing course');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  const handleCSVUpload = async (semesterId, event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target.result;
            const rows = text.split('\n');
            const newStudents = rows.slice(1).map(row => {
              const [rollNumber, name, email] = row.split(',');
              return {
                rollNumber: rollNumber?.trim(),
                name: name?.trim(),
                email: email?.trim()
              };
            }).filter(student => student.rollNumber && student.name && student.email);
            
            if (newStudents.length === 0) {
              setErrorMessage('No valid student data found in CSV');
              setShowErrorPopup(true);
              setIsLoading(false);
              return;
            }
            
            const response = await axios.post(`${API_URL}/semesters/${semesterId}/students/bulk`, {
              students: newStudents
            });
            
            if (response.data && response.data.semester) {
              const updatedSemester = response.data.semester;
              
              // Update both students state and semesters state
              setStudents({
                ...students,
                [semesterId]: updatedSemester.students
              });
              
              setSemesters(semesters.map(sem => 
                sem._id === semesterId ? updatedSemester : sem
              ));
              
              let successMsg = `${newStudents.length} students added successfully`;
              if (response.data.invalidStudents && response.data.invalidStudents.length > 0) {
                successMsg += `. ${response.data.invalidStudents.length} students could not be added.`;
              }
              
              showSuccess(successMsg);
            } else {
              throw new Error("Invalid response structure from server");
            }
            
            setIsLoading(false);
          } catch (err) {
            console.error("Error processing CSV:", err);
            setErrorMessage(err.response?.data?.message || 'Error processing CSV file');
            setShowErrorPopup(true);
            setIsLoading(false);
          }
        };
        
        reader.readAsText(file);
      } catch (err) {
        console.error("Error uploading CSV:", err);
        setErrorMessage(err.response?.data?.message || 'Error uploading CSV file');
        setShowErrorPopup(true);
        setIsLoading(false);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSingleStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.rollNumber || !newStudent.name || !newStudent.email) {
      setErrorMessage('All student fields are required');
      setShowErrorPopup(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_URL}/semesters/${activeSemesterId}/students`, newStudent);
      
      if (response.data && response.data.semester) {
        const updatedSemester = response.data.semester;
        
        // Update both students state and semesters state
        setStudents({
          ...students,
          [activeSemesterId]: updatedSemester.students
        });
        
        setSemesters(semesters.map(sem => 
          sem._id === activeSemesterId ? updatedSemester : sem
        ));
      } else {
        setStudents({
          ...students,
          [activeSemesterId]: response.data.students || []
        });
      }
      
      setNewStudent({
        rollNumber: '',
        name: '',
        email: ''
      });
      
      setShowAddStudent(false);
      showSuccess('Student added successfully');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error adding student:", err);
      setErrorMessage(err.response?.data?.message || 'Error adding student');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (semesterId, studentId) => {
    try {
      setIsLoading(true);

      const response = await axios.delete(`${API_URL}/semesters/${semesterId}/students/${studentId}`);
      
      if (response.data && response.data.semester) {
        const updatedSemester = response.data.semester;
        
        // Update both students state and semesters state
        setStudents({
          ...students,
          [semesterId]: updatedSemester.students
        });
        
        setSemesters(semesters.map(sem => 
          sem._id === semesterId ? updatedSemester : sem
        ));
      }
      
      showSuccess('Student removed successfully');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error removing student:", err);
      setErrorMessage(err.response?.data?.message || 'Error removing student');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  const handleSaveSemesterDetails = async (semesterId) => {
    try {
      setIsLoading(true);

      const semesterToUpdate = semesters.find(sem => sem._id === semesterId);
      if (!semesterToUpdate) {
        throw new Error('Semester not found');
      }

      const updateData = {
        courses: courses[semesterId] || [],
        students: students[semesterId] || [],
        startDate: semesterToUpdate.startDate,
        endDate: semesterToUpdate.endDate,
        session: semesterToUpdate.session
      };

      const response = await axios.put(`${API_URL}/semesters/${semesterId}`, updateData);
      const updatedSemester = response.data;

      setSemesters(semesters.map(sem => 
        sem._id === semesterId ? updatedSemester : sem
      ));

      showSuccess('Semester details saved successfully');
      setIsLoading(false);
    } catch (err) {
      console.error("Error saving semester details:", err);
      setErrorMessage(err.response?.data?.message || 'Error saving semester details');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSuccessMessage('');
  };

  const getTeacherName = (teacherId) => {
    if (!teacherId) return 'Unknown Teacher';
    
    if (typeof teacherId === 'object' && teacherId.name) {
      return teacherId.name;
    }
    
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  if (isLoading) {
    return (
      <div className="department-container">
        <div className="loading-spinner">
          <Loader size={48} className="animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="department-container">
      <button
        className="back-botn"
        onClick={() => setcomp("Programs")}
        aria-label="Back to Programs"
      >
        ←
      </button>

      <div className="semester-container">
        <form onSubmit={handleCreateSemester} className="semester-form">
          <h2 className="subjecth2">Add New Semester</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                <Calendar size={16} />
                Start Date:
              </label>
              <input
                id="startDate"
                className="custom-date-input"
                type="date"
                value={newSemester.startDate}
                onChange={(e) => setNewSemester({ ...newSemester, startDate: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">
                <Calendar size={16} />
                End Date:
              </label>
              <input
                id="endDate"
                className="custom-date-input"
                type="date"
                value={newSemester.endDate}
                onChange={(e) => setNewSemester({ ...newSemester, endDate: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="session">Session:</label>
              <input
                id="session"
                type="text"
                value={newSemester.session}
                onChange={(e) => setNewSemester({ ...newSemester, session: e.target.value })}
                placeholder="e.g., Fall 2024"
                required
              />
            </div>
            
            <button type="submit" className="create-btn">
              Create Semester
            </button>
          </div>
        </form>

        <div className="department-stats">
          <h3>Total Semesters: {semesters.length}</h3>
        </div>

        <div className="semesters-list">
          <table className="semesters-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map(semester => (
                <tr key={semester._id}>
                  <td>{semester.session}</td>
                  <td>{new Date(semester.startDate).toLocaleDateString()}</td>
                  <td>{new Date(semester.endDate).toLocaleDateString()}</td>
                  <td className="semester-actions">
                    <button 
                      onClick={() => handleUpdateSemester(semester._id)} 
                      className="icon-btn"
                      aria-label="Edit semester"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSemester(semester._id)} 
                      className="icon-btn delete"
                      aria-label="Delete semester"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => toggleSemesterView(semester._id)} 
                      className="icon-btn"
                      aria-label={expandedSemester === semester._id ? "Collapse details" : "Expand details"}
                    >
                      {expandedSemester === semester._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {semesters.map(semester => (
            expandedSemester === semester._id && (
              <div key={`details-${semester._id}`} className="semester-details">
                <div className="section-header">
                  <h3 className="subjecth3">Semester {semester.session}</h3>
                  <div className="section-actions">
                    <input
                      type="file"
                      accept=".csv"
                      ref={fileInputRef}
                      onChange={(e) => handleCSVUpload(semester._id, e)}
                      style={{ display: 'none' }}
                      className="file-input"
                      id="csv-upload"
                    />
                    <button 
                      type="button" 
                      onClick={handleUploadClick} 
                      className="upload-btn"
                      aria-label="Upload CSV file"
                    >
                      <Upload size={16} />
                      Upload CSV
                    </button>
                    <button 
                      className="add-btn"
                      onClick={() => {
                        setShowAddStudent(true);
                        setActiveSemesterId(semester._id);
                      }}
                      aria-label="Add student"
                    >
                      <UserPlus size={16} />
                      Add Student
                    </button>
                    <button 
                      className="view-btn"
                      onClick={() => toggleStudentsView(semester._id)}
                      aria-label={hideStudents[semester._id] ? "Show students" : "Hide students"}
                    >
                      {hideStudents[semester._id] ? <Eye size={16} /> : <EyeOff size={16} />}
                      {hideStudents[semester._id] ? 'Show Students' : 'Hide Students'}
                    </button>
                  </div>
                </div>

                {!hideStudents[semester._id] && students[semester._id] && (
                  <div className="students-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Roll Number</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students[semester._id].map((student) => (
                          <tr key={`student-${student._id}`}>
                            <td>{student.rollNumber}</td>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                            <td>
                              <button
                                onClick={() => handleDeleteStudent(semester._id, student._id)}
                                className="icon-btn delete"
                                aria-label="Remove student"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="courses-section">
                  <h3>Courses</h3>
                  <div className="add-course">
                    <select
                      value={newCourse.subjectId}
                      onChange={(e) => setNewCourse({ ...newCourse, subjectId: e.target.value })}
                      aria-label="Select subject"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={`subject-${subject._id}`} value={subject._id}>
                          {subject.code} - {subject.name}{subject.isLab && " (Lab)"}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newCourse.teacherId}
                      onChange={(e) => setNewCourse({ ...newCourse, teacherId: e.target.value })}
                      aria-label="Select teacher"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={`teacher-${teacher._id}`} value={teacher._id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleAddCourse(semester._id)} 
                      className="add-btn"
                      aria-label="Add course"
                    >
                      <Plus size={16} />
                      Add Course
                    </button>
                  </div>
                  <div className="sem-courses-list">
                    {courses[semester._id]?.map(course => (
                      <div key={`course-${course._id}`} className="sem-course-item">
                        <span>
                          {course.subjectId?.code} - {course.subjectId?.name}
                          {course.subjectId?.isLab && " (Lab)"}
                        </span>
                        <span>Teacher: {getTeacherName(course.teacherId)}</span>
                        <button 
                          onClick={() => handleDeleteCourse(semester._id, course._id)} 
                          className="icon-btn delete"
                          aria-label="Remove course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      className="save-btn"
                      onClick={() => handleSaveSemesterDetails(semester._id)}
                      aria-label="Save semester details"
                    >
                      Save Semester Details
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {showAddStudent && (
        <div className="modal-overlay">
          <div className="modal" role="dialog" aria-labelledby="add-student-title">
            <div className="modal-header">
              <h3 id="add-student-title">Add New Student</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddStudent(false)}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSingleStudent} className="student-form">
              <input
                type="text"
                placeholder="Roll Number"
                value={newStudent.rollNumber}
                onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                required
                aria-label="Student roll number"
              />
              <input
                type="text"
                placeholder="Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                required
                aria-label="Student name"
              />
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                required
                aria-label="Student email"
              />
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Add Student
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowAddStudent(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showErrorPopup && (
        <div className="modal-overlay">
          <div className="modal error-modal" role="alertdialog" aria-labelledby="error-title">
            <div className="modal-header">
              <h3 id="error-title">Error</h3>
              <button 
                className="close-btn"
                onClick={closeErrorPopup}
                aria-label="Close error dialog"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-content">
              <div className="error-icon">
                <AlertCircle size={48} color="red" />
              </div>
              <p className="error-message">{errorMessage}</p>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeErrorPopup}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="modal-overlay">
          <div className="modal success-modal" role="alertdialog" aria-labelledby="success-title">
            <div className="modal-header">
              <h3 id="success-title">Success</h3>
              <button 
                className="close-btn"
                onClick={closeSuccessPopup}
                aria-label="Close success dialog"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-content">
              <div className="success-icon">
                <CheckCircle size={48} color="green" />
              </div>
              <p className="success-message">{successMessage}</p>
              <div className="form-actions">
                <button type="button" className="submit-btn" onClick={closeSuccessPopup}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Semester;