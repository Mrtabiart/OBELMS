import React, { useState, useEffect } from 'react';
import './Loginform.css';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const LoginForm = ({ setName }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/check-auth`, {
          method: "GET",
          credentials: "include" 
        });
        
        const data = await res.json();
        
        if (res.ok && data.isAuthenticated) {
          console.log("User already authenticated:", data.user.username);
          setName(data.user.username);
          redirectBasedOnRole(data.user.role);
        }
      } catch (err) {
        // console.error("Auth check error:", err);
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const redirectBasedOnRole = (role) => {
    const roleLower = role.toLowerCase();
    // console.log(`Redirecting user to role-specific page: ${roleLower}`);
    
    if (roleLower === "student") navigate("/Student");
    else if (roleLower === "admin") navigate("/Admin");
    else if (roleLower === "teacher") navigate("/Teacher");
    else {
      console.warn(`Unknown role: ${roleLower}`);
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", formData.username);
      
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", 
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      // console.log("Login response status:", res.status);
      // console.log("Login response:", data);

      if (res.ok) {
        setName(data.user.username);
        
        // console.log("Login successful, redirecting based on role:", data.user.role);
        redirectBasedOnRole(data.user.role);
      } else {
        console.error("Login failed:", data.message);
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong connecting to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>" FIRST OBE SYSTEM NUML UNIVERSITY "</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <button type="button" className="forgot-password">
            Forgot Password?
          </button>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;