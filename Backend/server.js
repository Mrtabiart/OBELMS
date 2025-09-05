const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const path = require('path');
require("dotenv").config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.CLIENT_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60 
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      mongoConfigured: !!process.env.MONGO_URI,
      jwtSecretConfigured: !!process.env.JWT_SECRET,
      sessionSecretConfigured: !!process.env.SESSION_SECRET
    }
  });
});

console.log("Attempting to connect to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error("WARNING: Server starting without MongoDB connection!");
  });

// ✅ YEH NAYA ROUTE ADD KAREIN - CLO-PLO Mapping ka alag route
app.use("/api/cloplo", require("./routes/cloplogettingsub"));

// ✅ Purane routes (jo pehle se hain)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/programs", require("./routes/programRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes")); // ✅ Yeh rahega
app.use("/api/semesters", require("./routes/semesterRoutes"));
app.use("/api/trash", require("./routes/trashRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teacher", require("./routes/getsubjectforteacherRoutes"));
app.use("/api/student", require("./routes/getsubjectforstudentRoutes"));
app.use("/api/subject-sheet", require("./routes/getsubjectsheetRoutes")); 
app.use("/api/lostfound", require("./routes/lostfoundRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CLO-PLO mapping available at: http://localhost:${PORT}/api/cloplo/clo-plo-mapping/:courseId`);
});