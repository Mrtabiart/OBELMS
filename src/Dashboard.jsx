import React from 'react';
import './Dashboard.css';
import { 
  Building2, 
  BookOpen, 
  GraduationCap, 
  CalendarClock, 
  Users, 
  UserRound,
  UserCog,
  Trash2,  
  UserPlus 
} from 'lucide-react';

function StatCard({ title, count, icon, description, delay }) {
  return (
    <div 
      className="admindashboard-card" 
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="admindashboard-card-icon">
        {icon}
      </div>
      <div className="admindashboard-card-content">
        <h3 className="admindashboard-card-count">{count}</h3>
        <p className="admindashboard-card-title">{title}</p>
        <p className="admindashboard-card-description">{description}</p>
      </div>
    </div>
  );
}

function Dashboard({ name, setcomp }) {
  const stats = [
    { 
      id: 1, 
      title: 'Departments', 
      count: 12, 
      icon: <Building2 size={40} />,
      description: 'Active academic departments offering diverse educational programs'
    },
    { 
      id: 2, 
      title: 'Programs', 
      count: 24, 
      icon: <BookOpen size={40} />,
      description: 'Undergraduate and graduate programs across multiple disciplines'
    },
    { 
      id: 3, 
      title: 'Courses', 
      count: 148, 
      icon: <GraduationCap size={40} />,
      description: 'Available courses covering various subjects and specializations'
    },
    { 
      id: 4, 
      title: 'Semesters', 
      count: 8, 
      icon: <CalendarClock size={40} />,
      description: 'Academic terms structured throughout the educational year'
    },
    { 
      id: 5, 
      title: 'Teachers', 
      count: 87, 
      icon: <Users size={40} />,
      description: 'Dedicated faculty members providing quality education'
    },
    { 
      id: 6, 
      title: 'Students', 
      count: 1243, 
      icon: <UserRound size={40} />,
      description: 'Enrolled students pursuing their academic goals'
    },
    { 
      id: 7, 
      title: 'HODs', 
      count: 12, 
      icon: <UserCog size={40} />,
      description: 'Department heads leading academic excellence'
    },
  ];

  return (
    <div className="admindashboard-container">
      <h1 className="admindashboard-title">Welcome Respected , { name }</h1>
      <div className="admindashboard-stats-grid">
        {stats.map((stat, index) => (
          <StatCard 
            key={stat.id}
            title={stat.title}
            count={stat.count}
            icon={stat.icon}
            description={stat.description}
            delay={index * 0.1}
          />
        ))}
      </div>
       <div className="dshbord-section">
        <div className="dshbord-section-header">
        <h2 className="dshbord-section-title">Trash</h2>
        <p className="dshbord-section-description">The deleted details should be there</p>
          <button className="dshbord-button dshbord-button-trash"   onClick={() => {
            setcomp("Trash");
          }}>
            <Trash2 size={20} />
            <span>Trash</span>
          </button>
        </div>
      </div>
      
      <div className="dshbord-section">
        <div className="dshbord-section-header">
          <h2 className="dshbord-section-title">Students</h2>
          <p className="dshbord-section-description">You can add student to the university</p>
          <button className="dshbord-button dshbord-button-add"
           onClick={() => {
            setcomp("Addstudent");
          }}>
            <UserPlus size={20} />
            <span>Add </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;