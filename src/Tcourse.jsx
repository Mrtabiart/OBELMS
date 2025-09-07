import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Tcourse.css';
import { MdCreditScore } from "react-icons/md";

const CourseCard = ({ course, onClick }) => (
  <div className="course-card" onClick={onClick}>
    <div className="course-image">
      <img 
        src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
        alt={course.name} 
      />
      <span className="status-badge">Active</span>
    </div>
    <div className="course-content">
      <h3>{course.name}{course.isLab && " (Lab)"}</h3>
      <p className="course-code">{course.code}</p>
      <div className="course-info">
        <p><i className="students-icon"><MdCreditScore /></i> {course.creditHours} Credit Hours</p>
      </div>
    </div>
  </div>
);

const TeacherPanel = ({ setcomp }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/teacher/subjects', { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (Array.isArray(res.data)) {
          setCourses(res.data);
          res.data.forEach(course => {
          });
        } else {
          console.error('API response is not an array:', res.data);
          setCourses([]); 
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err.response || err);
        setError(err.response?.data?.message || 'Failed to load courses. Please try again later.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

 // ... existing code ...
 const handleCourseClick = (course) => {
  const semesterId = course.semesters[0];
  
  // Store both course ID and semester ID in sessionStorage
  sessionStorage.setItem('currentCourseId', course._id);
  sessionStorage.setItem('currentSemester', semesterId);
  
  if (course.isLab == true) {
    setcomp("Lab");
  } else {
    setcomp("Subjectsheet");
  }
};

  if (loading) {
    return (
      <div className="teacher-panel">
        <button className="back-botn" onClick={() => setcomp("Dashboard")}>←</button>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-panel">
        <button className="back-botn" onClick={() => setcomp("Dashboard")}>←</button>
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-panel">
      <button className="back-botn" onClick={() => setcomp("Dashboard")}>←</button>
      {courses.length === 0 ? (
        <div className="no-courses-container">
          <p>No courses assigned yet.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onClick={() => handleCourseClick(course)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherPanel;