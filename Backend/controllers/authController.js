const User = require("../models/userModel");
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { username, password } = req.body; 

  try {
    console.log(`Login attempt for user: ${username}`);
    
    
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    
    const teacherUser = await Teacher.findOne({ username, password });
    const studentUser = await Student.findOne({ username, password });
    const adminUser = await User.findOne({ username, password });
    
    let user = null;
    let role = null;

   
    if (adminUser) {
      user = adminUser;
      role = "admin"; 
    } else if (teacherUser) {
      user = teacherUser;
      role = "teacher";
    } else if (studentUser) {
      user = studentUser;
      role = "student";
    }

    
    if (!user) {
      // console.log(`User not found: ${username}`);
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // console.log(`User found in ${role} collection, generating token for: ${username}`);
    
    
    const payload = {
      id: user._id,
      username: user.username,
      role: role
    };
    
    
    const jwtSecret = process.env.JWT_SECRET || "your-temporary-secret-key";
    // console.log(`Using JWT secret: ${jwtSecret ? "Secret configured" : "Using default secret"}`);
    
   
    const token = jwt.sign(payload, jwtSecret, { 
      expiresIn: '24h' 
    });
    
   
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, 
      path: '/'
    };
    
    // console.log('Setting auth cookie with options:', cookieOptions);
    
    
    res.cookie('token', token, cookieOptions);
    
   
    if (req.session) {
      req.session.user = {
        id: user._id,
        username: user.username,
        role: role
      };
      // console.log('User info stored in session');
    } else {
      // console.log('Session not available');
    }
    
    // console.log('Login successful, sending response');
    
    res.status(200).json({ 
      message: "Login successful", 
      user: {
        username: user.username,
        role: role
      },
      token 
    });
  } catch (err) {
    // console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const checkAuth = async (req, res) => {
  try {
    
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ isAuthenticated: false, message: "No token provided" });
    }
    
   
    const jwtSecret = process.env.JWT_SECRET || "your-temporary-secret-key";
    const decoded = jwt.verify(token, jwtSecret);
    
    
    let user = null;
    
    if (decoded.role === "admin") {
      user = await User.findById(decoded.id).select('-password');
    } else if (decoded.role === "teacher") {
      user = await Teacher.findById(decoded.id).select('-password');
    } else if (decoded.role === "student") {
      user = await Student.findById(decoded.id).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({ isAuthenticated: false, message: "User not found" });
    }
    
    res.status(200).json({ 
      isAuthenticated: true, 
      user: {
        username: user.username,
        role: decoded.role
      }
    });
  } catch (err) {
    // console.error("Auth check error:", err);
    res.status(401).json({ isAuthenticated: false, message: "Invalid token" });
  }
};

const logoutUser = (req, res) => {
  
  res.clearCookie('token');
  
  
  if (req.session) {
    req.session.destroy();
    res.status(200).json({ message: "Logged out successfully" });
  }
  
};

module.exports = { loginUser, checkAuth, logoutUser };