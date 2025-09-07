import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Tcourse.css';
import { IoPeopleSharp } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";

const CourseCard = ({ course, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
          <p><i className="credit-icon"><IoPeopleSharp /></i> {course.teacherName}</p>
          <p><i className="credit-icon"><FaCalendarAlt /></i> {formatDate(course.startDate)} - {formatDate(course.endDate)}</p>
        </div>
      </div>
    </div>
  );
};

const StudentPanel = ({ setcomp }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [semesterInfo, setSemesterInfo] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('/api/student/subjects', {
          withCredentials: true,
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Expecting { groups: [ { semesterNumber, courses: [...] } ], semesterInfo: {...} }
        const payload = res.data;
        if (payload && Array.isArray(payload.groups)) {
          // Sort groups by semesterNumber, and within each group courses by name/code
          const normalized = payload.groups
            .filter(g => g && typeof g.semesterNumber !== 'undefined')
            .sort((a, b) => (a.semesterNumber || 0) - (b.semesterNumber || 0))
            .map(g => ({
              semesterNumber: g.semesterNumber,
              courses: Array.isArray(g.courses) ? g.courses.map(c => ({
                _id: c._id || c.subjectId,
                name: c.name,
                code: c.code,
                creditHours: c.creditHours,
                isLab: !!c.isLab,
                teacherName: c.teacherName || 'Unknown Teacher',
                semesterNumber: c.semesterNumber,
                semesterId: c.semesterId,
                startDate: c.startDate,
                endDate: c.endDate,
                session: c.session
              })) : []
            }));

          setGroups(normalized);
          setSemesterInfo(payload.semesterInfo || null);
          // Set first semester as default selected
          if (normalized.length > 0) {
            setSelectedSemester(normalized[0].semesterNumber);
          }
        } else {
          setGroups([]);
          setError("Invalid data format received from server");
        }
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleCourseClick = (course) => {
    localStorage.setItem('selectedCourseId', course._id);
    localStorage.setItem('selectedSemesterId', course.semesterId);
    
    // Check if course is lab, then go to slabsheet, otherwise go to Ssheet
    if (course.isLab) {
      setcomp("Slabsheet");
    } else {
      setcomp("Ssheet");
    }
  };

  const handleSemesterClick = (semesterNumber) => {
    setSelectedSemester(semesterNumber);
  };

  if (loading) {
    return (
      <div className="teacher-panel">
        <div className="header-row">
          <button className="back-botn" onClick={() => setcomp("sdashboard")}>←</button>
        </div>
        <div className="loading-container">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-panel">
        <div className="header-row">
          <button className="back-botn" onClick={() => setcomp("sdashboard")}>←</button>
        </div>
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentGroup = groups.find(g => g.semesterNumber === selectedSemester);

  return (
    <div className="teacher-panel">
      <div className="header-row">
        <button className="back-botn" onClick={() => setcomp("sdashboard")}>←</button>
      </div>

      {(!groups || groups.length === 0) ? (
        <div className="no-courses-container">
          <p>No courses assigned yet.</p>
        </div>
      ) : currentGroup ? (
        <div className="semester-group">
          <div className="semester-pagination">
            <div className="semester-buttons-container">
              {groups.map(group => (
                <button
                  key={group.semesterNumber}
                  className={`semester-btn ${selectedSemester === group.semesterNumber ? 'active' : ''}`}
                  onClick={() => handleSemesterClick(group.semesterNumber)}
                >
                  {group.semesterNumber}
                </button>
              ))}
            </div>
          </div>
          <div className="courses-grid">
            {currentGroup.courses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course}  
                onClick={() => handleCourseClick(course)} 
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="no-courses-container">
          <p>No courses found for selected semester.</p>
        </div>
      )}
    </div>
  );
};

export default StudentPanel;