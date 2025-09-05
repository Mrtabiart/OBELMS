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

  // Add new state variables for the numbered content system
  const [currentContentSection, setCurrentContentSection] = useState({});
  const [currentPage, setCurrentPage] = useState({});
  const [showAddSemesterConfirm, setShowAddSemesterConfirm] = useState(false);
  const [semesterNumber, setSemesterNumber] = useState({});
  const itemsPerPage = 5; // Number of items to show per page

  // Add new state variables for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Add the missing state variable
  const [activeSemesterForTab, setActiveSemesterForTab] = useState(null);

  // Add function to get students for specific semester content
  const getStudentsForSemesterContent = (semester, semesterNumber) => {
    if (semester.semesterContents && semester.semesterContents.length > 0) {
      const content = semester.semesterContents.find(c => c.semesterNumber === semesterNumber);
      return content ? content.students : [];
    }
    // Fallback for old structure
    return semester.students || [];
  };

  // Add function to get courses for specific semester content
  const getCoursesForSemesterContent = (semester, semesterNumber) => {
    if (semester.semesterContents && semester.semesterContents.length > 0) {
      const content = semester.semesterContents.find(c => c.semesterNumber === semesterNumber);
      return content ? content.courses : [];
    }
    // Fallback for old structure
    return semester.courses || [];
  };

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
            // Handle new structure with semesterContents
            if (semester.semesterContents && semester.semesterContents.length > 0) {
              // Use the first semester content for initial display
              const firstContent = semester.semesterContents[0];
              coursesObj[semester._id] = firstContent.courses || [];
              studentsObj[semester._id] = firstContent.students || [];
              
              // Initialize semester number for this semester
              setSemesterNumber(prev => ({
                ...prev,
                [semester._id]: semester.semesterContents.length
              }));
              setCurrentContentSection(prev => ({
                ...prev,
                [semester._id]: 1
              }));
            } else {
              // Fallback for old structure
              coursesObj[semester._id] = semester.courses || [];
              studentsObj[semester._id] = semester.students || [];
            }
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
      
      // Add semesterNumber to the request body
      const courseData = {
        ...newCourse,
        semesterNumber: currentContentSection[semesterId] || 1 // Use current active tab number for this semester
      };
      
      const response = await axios.post(`${API_URL}/semesters/${semesterId}/courses`, courseData);
      const updatedSemester = response.data;
      
      // Update both the courses state and semesters state
      setCourses({
        ...courses,
        [semesterId]: updatedSemester.semesterContents || []
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

      // Add semesterNumber to the request body
      const deleteData = {
        semesterNumber: currentContentSection[semesterId] || 1 // Use current active tab number for this semester
      };

      const response = await axios.delete(`${API_URL}/semesters/${semesterId}/courses/${courseId}`, {
        data: deleteData
      });
      const updatedSemester = response.data.semester;
      
      // Update both the courses state and semesters state
      setCourses({
        ...courses,
        [semesterId]: updatedSemester.semesterContents || []
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
            
            const currentSection = currentContentSection[semesterId] || 1;
            
            // Add semesterNumber to the request body
            const uploadData = {
              students: newStudents,
              semesterNumber: currentSection
            };
            
            const response = await axios.post(`${API_URL}/semesters/${semesterId}/students/bulk`, uploadData);
            
            if (response.data && response.data.semester) {
              const updatedSemester = response.data.semester;
              
              // Update the semester data without affecting courses
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
      
      const semesterId = activeSemesterId;
      const currentSection = currentContentSection[semesterId] || 1;
      
      // Add semesterNumber to the request body
      const studentData = {
        ...newStudent,
        semesterNumber: currentSection
      };
      
      const response = await axios.post(`${API_URL}/semesters/${semesterId}/students`, studentData);
      
      if (response.data && response.data.semester) {
        const updatedSemester = response.data.semester;
        
        // Update the semester data with proper population
        setSemesters(semesters.map(sem => 
          sem._id === semesterId ? updatedSemester : sem
        ));
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

      const currentSection = currentContentSection[semesterId] || 1;

      // Add semesterNumber to the request body
      const deleteData = {
        semesterNumber: currentSection
      };

      const response = await axios.delete(`${API_URL}/semesters/${semesterId}/students/${studentId}`, {
        data: deleteData
      });
      
      if (response.data && response.data.semester) {
        const updatedSemester = response.data.semester;
        
        // Update the semester data with proper population
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

  // Add function to handle content section changes for specific semester
  const handleContentSectionChange = (semesterId, sectionNumber) => {
    setCurrentContentSection(prev => ({
      ...prev,
      [semesterId]: sectionNumber
    }));
    setCurrentPage(prev => ({
      ...prev,
      [semesterId]: 1
    }));
  };

  // Add function to handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to get paginated data based on current section
  const getPaginatedData = (data, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Function to get total pages for pagination
  const getTotalPages = (data, itemsPerPage) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  // Add function to handle add semester confirmation for specific semester
  const handleAddSemesterConfirm = () => {
    if (!activeSemesterForTab) return;
    
    setShowAddSemesterConfirm(false);
    
    // Call the function to add semester content
    handleAddSemesterContent(activeSemesterForTab);
    
    // Reset the active semester for tab
    setActiveSemesterForTab(null);
  };

  // Add function to handle delete confirmation
  const handleDeleteClick = (semester) => {
    setSemesterToDelete(semester);
    setDeleteConfirmationText('');
    setShowDeleteConfirm(true);
  };

  // Add function to handle actual deletion
  const handleConfirmDelete = async () => {
    if (deleteConfirmationText === semesterToDelete.session) {
      try {
        setIsLoading(true);
        await axios.delete(`${API_URL}/semesters/${semesterToDelete._id}`);

        setSemesters(semesters.filter(sem => sem._id !== semesterToDelete._id));
        
        const newCourses = { ...courses };
        const newStudents = { ...students };
        const newHideStudents = { ...hideStudents };
        
        delete newCourses[semesterToDelete._id];
        delete newStudents[semesterToDelete._id];
        delete newHideStudents[semesterToDelete._id];
        
        setCourses(newCourses);
        setStudents(newStudents);
        setHideStudents(newHideStudents);
        
        showSuccess('Batch deleted successfully');
        setShowDeleteConfirm(false);
        setSemesterToDelete(null);
        setDeleteConfirmationText('');
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error deleting semester:", err);
        setErrorMessage(err.response?.data?.message || 'Error deleting batch');
        setShowErrorPopup(true);
        setIsLoading(false);
      }
    } else {
      setErrorMessage('Batch name does not match. Please retype correctly.');
      setShowErrorPopup(true);
    }
  };

  // Add function to handle add semester content
  const handleAddSemesterContent = async (semesterId) => {
    try {
      setIsLoading(true);
      
      const currentTabs = semesterNumber[semesterId] || 1;
      const newTabNumber = currentTabs + 1;
      
      const response = await axios.post(`${API_URL}/semesters/${semesterId}/semester-content`, {
        semesterNumber: newTabNumber
      });
      
      const updatedSemester = response.data;
      
      // Update the semester data
      setSemesters(semesters.map(sem => 
        sem._id === semesterId ? updatedSemester : sem
      ));
      
      // Update local state for this specific semester
      setSemesterNumber(prev => ({
        ...prev,
        [semesterId]: newTabNumber
      }));
      setCurrentContentSection(prev => ({
        ...prev,
        [semesterId]: newTabNumber
      }));
      
      showSuccess('New semester content section added successfully');
      setIsLoading(false);
    } catch (err) {
      console.error("Error adding semester content:", err);
      setErrorMessage(err.response?.data?.message || 'Error adding semester content');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  // Initialize semester tabs when semester is expanded
  const initializeSemesterTabs = (semesterId) => {
    if (!semesterNumber[semesterId]) {
      setSemesterNumber(prev => ({
        ...prev,
        [semesterId]: 1
      }));
      setCurrentContentSection(prev => ({
        ...prev,
        [semesterId]: 1
      }));
    }
  };

  // Update the students display to use current tab number for specific semester
  const getCurrentStudents = (semester) => {
    const semesterId = semester._id;
    const currentSection = currentContentSection[semesterId] || 1;
    
    if (semester.semesterContents && semester.semesterContents.length > 0) {
      const content = semester.semesterContents.find(c => c.semesterNumber === currentSection);
      return content ? content.students : [];
    }
    return semester.students || [];
  };

  // Update the courses display to use current tab number for specific semester
  const getCurrentCourses = (semester) => {
    const semesterId = semester._id;
    const currentSection = currentContentSection[semesterId] || 1;
    
    if (semester.semesterContents && semester.semesterContents.length > 0) {
      const content = semester.semesterContents.find(c => c.semesterNumber === currentSection);
      if (content && content.courses) {
        // Return courses with properly populated data
        return content.courses.map(course => {
          // Ensure we have the populated subject and teacher data
          const subject = subjects.find(s => s._id === course.subjectId);
          const teacher = teachers.find(t => t._id === course.teacherId);
          
          return {
            ...course,
            subjectId: subject || course.subjectId,
            teacherId: teacher || course.teacherId
          };
        });
      }
      return [];
    }
    // Fallback for old structure
    return semester.courses || [];
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
          <h2 className="subjecth2">Add New Batch</h2>
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
              Create Batch
            </button>
          </div>
        </form>

        <div className="department-stats">
          <h3>Total Batch : {semesters.length}</h3>
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
              {semesters.map((semester, index) => (
                <React.Fragment key={semester._id}>
                  <tr>
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
                        onClick={() => handleDeleteClick(semester)} 
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
                  
                  {/* Semester Details - Show right after the row */}
                  {expandedSemester === semester._id && (
                    <tr>
                      <td colSpan="4" className="semester-details-cell">
                        {(() => {
                          // Initialize tabs for this semester if not already done
                          initializeSemesterTabs(semester._id);
                          const currentSemesterTabs = semesterNumber[semester._id] || 1;
                          const currentSemesterSection = currentContentSection[semester._id] || 1;
                          
                          return (
                            <div className="semester-details">
                              <div className="section-header">
                                <h3 className="subjecth3">Batch {semester.session}</h3>
                                {/* Show action buttons based on which tab is active for this semester */}
                                {currentSemesterSection === currentSemesterTabs ? (
                                  // Latest tab - show all buttons
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
                                      CSV Upload
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
                                    <button 
                                      className={`add-semester-btn ${currentSemesterTabs >= 8 ? 'disabled' : ''}`}
                                      onClick={() => {
                                        if (currentSemesterTabs < 8) {
                                          setActiveSemesterForTab(semester._id);
                                          setShowAddSemesterConfirm(true);
                                        }
                                      }}
                                      disabled={currentSemesterTabs >= 8}
                                      aria-label="Add new semester content"
                                    >
                                      <Plus size={16} />
                                      Add Semester ({currentSemesterTabs}/8)
                                    </button>
                                  </div>
                                ) : (
                                  // Previous tabs - show only Show Students button
                                  <div className="section-actions">
                                    <button 
                                      className="view-btn"
                                      onClick={() => toggleStudentsView(semester._id)}
                                      aria-label={hideStudents[semester._id] ? "Show students" : "Hide students"}
                                    >
                                      {hideStudents[semester._id] ? <Eye size={16} /> : <EyeOff size={16} />}
                                      {hideStudents[semester._id] ? 'Show Students' : 'Hide Students'}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Numbered Content Sections - Individual for each semester */}
                              <div className="numbered-content-sections">
                                <div className="section-tabs">
                                  {Array.from({ length: currentSemesterTabs }, (_, i) => i + 1).map((sectionNumber) => (
                                    <button
                                      key={sectionNumber}
                                      className={`section-tab ${currentSemesterSection === sectionNumber ? 'active' : ''}`}
                                      onClick={() => handleContentSectionChange(semester._id, sectionNumber)}
                                    >
                                      {sectionNumber}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Show Students Section - Only for current semester */}
                              {!hideStudents[semester._id] && (
                                <div className="students-table">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Roll Number</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        {/* Only show Actions column when on latest tab */}
                                        {currentSemesterSection === currentSemesterTabs && <th>Actions</th>}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {getCurrentStudents(semester).map((student) => (
                                        <tr key={`student-${student._id}`}>
                                          <td>{student.rollNumber}</td>
                                          <td>{student.name}</td>
                                          <td>{student.email}</td>
                                          {/* Only show delete button when on latest tab */}
                                          {currentSemesterSection === currentSemesterTabs && (
                                            <td>
                                              <button
                                                onClick={() => handleDeleteStudent(semester._id, student._id)}
                                                className="icon-btn delete"
                                                aria-label="Remove student"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Courses Section - Individual for each semester */}
                              <div className="courses-section">
                                <h3>Courses</h3>
                                {/* Only show add course form when latest tab is active for this semester */}
                                {currentSemesterSection === currentSemesterTabs && (
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
                                )}
                                <div className="sem-courses-list">
                                  {getCurrentCourses(semester).map(course => (
                                    <div key={`course-${course._id}`} className="sem-course-item">
                                      <span>
                                        {course.subjectId?.code} - {course.subjectId?.name}
                                        {course.subjectId?.isLab && " (Lab)"}
                                      </span>
                                      <span>Teacher: {getTeacherName(course.teacherId)}</span>
                                      {/* Only show delete button when latest tab is active for this semester */}
                                      {currentSemesterSection === currentSemesterTabs && (
                                        <button 
                                          onClick={() => handleDeleteCourse(semester._id, course._id)} 
                                          className="icon-btn delete"
                                          aria-label="Remove course"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  {/* Only show save button when latest tab is active for this semester */}
                                  {currentSemesterSection === currentSemesterTabs && (
                                    <button 
                                      className="save-btn"
                                      onClick={() => handleSaveSemesterDetails(semester._id)}
                                      aria-label="Save semester details"
                                    >
                                      Save Semester Details
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
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

      {/* Add Semester Confirmation Modal */}
      {showAddSemesterConfirm && (
        <div className="modal-overlay">
          <div className="modal" role="dialog" aria-labelledby="add-semester-title">
            <div className="modal-header">
              <h3 id="add-semester-title">Add New Semester Section</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddSemesterConfirm(false);
                  setActiveSemesterForTab(null);
                }}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-content">
              <div className="confirmation-icon">
                <AlertCircle size={48} color="#4299e1" />
              </div>
              <p className="confirmation-message">Are you sure you want to add a new semester section?</p>
              <div className="form-actions">
                <button type="button" className="submit-btn" onClick={handleAddSemesterConfirm}>
                  Yes, Add Section
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowAddSemesterConfirm(false);
                    setActiveSemesterForTab(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && semesterToDelete && (
        <div className="modal-overlay">
          <div className="modal" role="dialog" aria-labelledby="delete-semester-title">
            <div className="modal-header">
              <h3 id="delete-semester-title">Delete Batch Confirmation</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSemesterToDelete(null);
                  setDeleteConfirmationText('');
                }}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-content">
              <div className="delete-icon">
                <AlertCircle size={48} color="#e53e3e" />
              </div>
              <p className="delete-message">
                This action cannot be undone. To delete the batch <strong>"{semesterToDelete.session}"</strong>, 
                please retype the batch name below:
              </p>
              <div className="delete-input-container">
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={`Type: ${semesterToDelete.session}`}
                  className="delete-confirmation-input"
                  aria-label="Confirm batch name for deletion"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="delete-confirm-btn" 
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmationText !== semesterToDelete.session}
                >
                  Delete Batch
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSemesterToDelete(null);
                    setDeleteConfirmationText('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
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