import React, { useEffect, useState } from 'react';
import './Profile.css';
import zaabitImage from './Asset/zaabit.jpg'; 
import axios from 'axios';

const Profile = () => {
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
        } else {
          console.error('API response is not an array:', res.data);
          setCourses([]);
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err.response || err);
        setError(err.response?.data?.message || 'Failed to load courses.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const teacherData = {
    name: "Zabit Mehmood",
    email: "mrtabiart@gmail.com",
    phone: "03344806283",
    image: zaabitImage
  };

  if (loading) {
    return (
      <div className="department-container">
        <div className="profile-container">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-container">
        <div className="profile-container">
          <p>{error}</p>
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
              <img 
                src={teacherData.image} 
                alt={teacherData.name} 
                className="profile-image"
              />
            </div>
            <div className="profile-basic-info">
              <h2 className="profile-name">
                {teacherData.name}
              </h2>
              <div className="info-item">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                </svg>
                <p>{teacherData.email}</p>
              </div>
              <div className="info-item">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <p>{teacherData.phone}</p>
              </div>
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
              {courses.length === 0 ? (
                <p>No courses assigned yet.</p>
              ) : (
                <ul className="profile-courses-list">
                  {courses.map((course) => (
                    <li key={course._id} className="profile-course-item">
                      <svg className="course-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                      {course.name}
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