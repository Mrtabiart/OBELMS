import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
// import zaabitImage from './Asset/zaabit.jpg'; 

const Profile = () => {
  const [studentData, setStudentData] = useState({
    name: "",
    courses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // First fetch student's basic info
        const studentInfoRes = await axios.get('/api/student/profile', {
          withCredentials: true,
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Then fetch student's courses
        const coursesRes = await axios.get('/api/student/subjects', {
          withCredentials: true,
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (Array.isArray(coursesRes.data)) {
          setStudentData({
            name: studentInfoRes.data.name || "Student",
            courses: coursesRes.data.map(course => course.name)
          });
        } else {
          setError("Invalid data format received from server");
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="department-container">
        <div className="profile-container">
          <div className="profile-card">
            <p>Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-container">
        <div className="profile-container">
          <div className="profile-card">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="department-container">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-left">
            <div className="profile-image-container">
              {/* <img 
                src={teacherData.image} 
                alt={teacherData.name} 
                className="profile-image"
                /> */}
            </div>
            <div className="profile-basic-info">
              <h2 className="profile-name" style={{ display: 'flex', justifyContent: 'center' }}>
                {studentData.name}
              </h2>
            </div>
          </div>

          <div className="profile-right">
            <div className="courses-section">
              <h3>
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
                Current Courses
              </h3>
              {studentData.courses.length === 0 ? (
                <p>No courses enrolled yet.</p>
              ) : (
                <ul className="profile-courses-list">
                  {studentData.courses.map((course, index) => (
                    <li key={index} className="profile-course-item">
                      <svg className="course-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                      {course}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;