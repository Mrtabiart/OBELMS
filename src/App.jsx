import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./App.css";
import TopBar from "./Topbar";
import Footer from "./Footer";
import Loginform from "./Loginform";
import Admin from "./Admin";
import Department from "./Department";
import Programs from "./Programs";
import Dashboard from "./Dashboard";
import Subjectmap from "./Subjectmap";
import Semester from "./Semester";
import Teacher from "./Teacher";
import Student from "./Student";
import TDashboard from "./TDashboard";
import Tprofile from "./Profile";
import Tcourse from "./Tcourse";
import Subjectsheet from "./Subjectsheet";
import Help from "./Help";
import Sdashboard from "./Sdashboard";
import Studentprofile from "./Studentprofile";
import Scourse from "./Scourse";
import Ssheet from "./Ssheet";
import Addteacher from "./Addteacher";
import Addstudent from "./Addstudent";
import Trash from "./Trash";
import Labsheet from "./Labsheet"
import Gpacalculator from "./Gpacalculator";  
import Lostfoundadmin from "./Lostfoundadmin";
import LostfoundStudent from "./Lostfoundstudent";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/check-auth", {
          method: "GET",
          credentials: "include" 
        });
        
        const data = await res.json();
        
        if (res.ok && data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserRole(data.user.role.toLowerCase());
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const [name, setName] = useState(""); 
  const [activeComponent, setActiveComponent] = useState("Dashboard"); 

  const renderComponent = () => {
    switch (activeComponent) {
      case "Department":
        return <Department setcomp={setActiveComponent} />;
      case "Programs":
        return <Programs setcomp={setActiveComponent} />;
      case "Dashboard":
        return <Dashboard name={name} setcomp={setActiveComponent} />;
      case "Courses":
        return <Subjectmap name={name} setcomp={setActiveComponent} />;
      case "Lost & Found":
        return <Lostfoundadmin setcomp={setActiveComponent} />;
      case "Semester":
        return <Semester setcomp={setActiveComponent} />;
      case "Addteacher":
        return <Addteacher setcomp={setActiveComponent} />;
      case "Addstudent":
        return <Addstudent setcomp={setActiveComponent} />;
      case "Trash":
        return <Trash setcomp={setActiveComponent} />;
      case "Logout":
          return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };
  
  const rendertComponent = () => {
    switch (activeComponent) {
      case "Dashboard":
        return <TDashboard setcomp={setActiveComponent} />;
      case "Profile":
        return <Tprofile setcomp={setActiveComponent} />;
      case "Go To LMS":
        return <Dashboard setcomp={setActiveComponent} />;
      case "Subjects":
        return <Tcourse setcomp={setActiveComponent} />;
      case "Subjectsheet":
        return <Subjectsheet setcomp={setActiveComponent} />;
      case "Logout":
        return <Dashboard />;
      case "Help":
        return <Help setcomp={setActiveComponent} />;
      case "Tcourse":
        return <Tcourse setcomp={setActiveComponent} />;
      case "Lab":
        return <Labsheet setcomp={setActiveComponent} />;
      default:
        return <Dashboard />;
    }
  };

  const renderSComponent = () => {
    switch (activeComponent) {
      case "sdashboard":
        return <Sdashboard setcomp={setActiveComponent} />;
      case "sprofile":
        return <Studentprofile setcomp={setActiveComponent} />;
      case "GPA Calculator":
        return <Gpacalculator setcomp={setActiveComponent} />;
      case "ssubjects":
        return <Scourse setcomp={setActiveComponent} />;
      case "Scourse":
        return <Scourse setcomp={setActiveComponent} />;
      case "Ssheet":
        return <Ssheet setcomp={setActiveComponent} />;
      case "Logout":
        return <Dashboard />;
      case "Lost & Found":
        return <LostfoundStudent setcomp={setActiveComponent} />;
      case "Help":
        return <Help setcomp={setActiveComponent} />;
      default:
        return <Sdashboard />;
    }
  };

   const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        credentials: "include" 
      });
      
      const data = await response.json();
      console.log("Logout response:", data);
      
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <TopBar />
                <Navbar />
                <Loginform setName={setName} />
                <Footer />
              </div>
            }
          />

          <Route
            path="/Loginform"
            element={
              <div>
                <TopBar />
                <Navbar />
                <Loginform setName={setName} />
                <Footer />
              </div>
            }
          />

          <Route
            path="/Admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>
                  <TopBar />
                  <div className="app">
                    <Admin name={name} setcomp={setActiveComponent} onLogout={handleLogout} />
                    <div className="mcontent">
                      {renderComponent()}
                      <Footer />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/Teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <div>
                  <TopBar />
                  <div className="app">
                    <Teacher name={name} setcomp={setActiveComponent} onLogout={handleLogout} />
                    <div className="mcontent">
                      {rendertComponent()}
                      <Footer />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/Student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <div>
                  <TopBar />
                  <div className="app">
                    <Student name={name} setcomp={setActiveComponent} onLogout={handleLogout} />
                    <div className="mcontent">
                      {renderSComponent()}
                      <Footer />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;