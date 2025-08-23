import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Tcourse.css';
import { IoPeopleSharp } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";

const CourseCard = ({ course, onClick }) => {
  return (
    <div className="course-card" onClick={onClick}> 
      <div className="course-image">
        <img 
          src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
          alt={course.name} 
        />
        <span className="status-badge">Active</span>
      </div>
      <div className="course-content">
        <h3>{course.name} {course.isLab && "(Lab)"}</h3>
        <p className="course-code">{course.code}</p>
        <div className="course-info">
          <p><i className="credit-icon"><FaBookOpen /></i> {course.creditHours} Credit Hours</p>
        </div>
      </div>
    </div>
  );
};

const StudentPanel = ({ setcomp }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        console.log('Fetching subjects...');
        const res = await axios.get('/api/student/subjects', {
          withCredentials: true,
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('API Response:', res.data);

        if (Array.isArray(res.data)) {
          console.log('Response is an array, length:', res.data.length);
          // Add default progress for each course
          const coursesWithProgress = res.data.map(course => {
            console.log('Processing course:', course);
            return {
              _id: course._id,
              name: course.name,
              code: course.code,
              creditHours: course.creditHours,
              isLab: course.isLab || false
            };
          });
          console.log('Processed courses:', coursesWithProgress);
          setCourses(coursesWithProgress);
        } else {
          console.error('Response is not an array:', res.data);
          setCourses([]);
          setError("Invalid data format received from server");
        }
      } catch (err) {
        console.error('Error details:', err.response || err);
        setError('Failed to load courses. Please try again later.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleCourseClick = (courseId) => {
    // Store selected course ID in localStorage or context for the course detail page
    localStorage.setItem('selectedCourseId', courseId);
    setcomp("Ssheet");
  };

  if (loading) {
    return (
      <div className="teacher-panel">
        <button className="back-botn" onClick={() => setcomp("sdashboard")}>←</button>
        <div className="loading-container">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-panel">
        <button className="back-botn" onClick={() => setcomp("sdashboard")}>←</button>
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-panel">
      <button className="back-botn" onClick={() => setcomp("sdashboard")}>←</button>
      {courses.length === 0 ? (
        <div className="no-courses-container">
          <p>No courses assigned yet.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course}  
              onClick={() => handleCourseClick(course._id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentPanel;