import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UserPlus, UploadCloud, Eye, EyeOff, Search, Trash2, X } from 'lucide-react';
import './AddStudent.css';

function AddStudent() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStudents, setShowStudents] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
  });

  const API_URL = "http://localhost:5000/api/students";
  
  
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL);
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setErrorMessage("Failed to fetch students data. Please check your connection.");
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    if (!formData.name || !formData.rollNumber || !formData.email) {
      setErrorMessage("Please fill all fields");
      setShowErrorPopup(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(API_URL, formData);
      setStudents((prev) => [...prev, res.data]);
      setFormData({ name: "", rollNumber: "", email: "" });
      setShowAddModal(false);
      setErrorMessage("Student added successfully");
      setShowErrorPopup(true);
    } catch (err) {
      console.error("Error adding student:", err);
      setErrorMessage(err.response?.data?.message || "Failed to add student");
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_URL}/${id}`);
        setStudents((prev) => prev.filter((student) => student._id !== id));
        setErrorMessage("Student deleted successfully");
        setShowErrorPopup(true);
      } catch (err) {
        console.error("Error deleting student:", err);
        setErrorMessage(err.response?.data?.message || "Failed to delete student");
        setShowErrorPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csvText = e.target.result;
          console.log("CSV content loaded");
         
          const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== '');
          console.log(`CSV contains ${rows.length} rows`);
          
          if (rows.length <= 1) {
            throw new Error('CSV file contains no data rows');
          }
          
          const parseCSVRow = (row) => {
            const result = [];
            let insideQuotes = false;
            let currentValue = '';
            
            for (let i = 0; i < row.length; i++) {
              const char = row[i];
              
              if (char === '"') {
                insideQuotes = !insideQuotes;
              } else if (char === ',' && !insideQuotes) {
                result.push(currentValue.trim());
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            
           
            result.push(currentValue.trim());
            return result;
          };
          
         
          const headerRow = parseCSVRow(rows[0]);
          console.log("Header row:", headerRow);
          
         
          let nameIndex = headerRow.findIndex(col => 
            col.toLowerCase().includes('name') || col.trim() === 'name');
          let rollIndex = headerRow.findIndex(col => 
            col.toLowerCase().includes('roll') || col.trim() === 'rollnumber');
          let emailIndex = headerRow.findIndex(col => 
            col.toLowerCase().includes('email') || col.trim() === 'email');
          
         
          if (nameIndex === -1) nameIndex = 1;
          if (rollIndex === -1) rollIndex = 0;
          if (emailIndex === -1) emailIndex = 2;
          
          console.log(`Using column indices - Roll: ${rollIndex}, Name: ${nameIndex}, Email: ${emailIndex}`);
        
          const studentsData = [];
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; 
            
            const cols = parseCSVRow(rows[i]);
            if (cols.length < Math.max(rollIndex, nameIndex, emailIndex) + 1) {
              console.warn(`Row ${i} has insufficient columns, skipping:`, rows[i]);
              continue; 
            }
            
            const student = {
              rollNumber: cols[rollIndex].trim(),
              name: cols[nameIndex].trim(),
              email: cols[emailIndex].trim()
            };
            
           
            if (student.rollNumber && student.name && student.email) {
              studentsData.push(student);
              console.log(`Row ${i}: Added student ${student.name}`);
            } else {
              console.warn(`Row ${i}: Missing required fields, skipping:`, student);
            }
          }
          
          console.log(`Processed ${studentsData.length} valid students from CSV`);
          
          if (studentsData.length === 0) {
            throw new Error('No valid student records found in CSV');
          }
          
          
          console.log(`Sending ${studentsData.length} students to backend`);
          console.log("Student data sample:", studentsData.slice(0, 3));
          
          const response = await axios.post(`${API_URL}/bulk`, { 
            students: studentsData 
          });
          
          console.log("Backend response:", response.data);
          
          
          setErrorMessage(`Successfully added ${response.data.students.length} students`);
          setShowErrorPopup(true);
          
          
          fetchStudents();
        } catch (err) {
          console.error("CSV processing error:", err);
          setErrorMessage(err.response?.data?.message || err.message || "Error processing CSV file");
          setShowErrorPopup(true);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        console.error("Error reading file");
        setErrorMessage("Failed to read CSV file");
        setShowErrorPopup(true);
        setIsLoading(false);
      };
      
      console.log("Starting to read CSV file");
      reader.readAsText(file);
    } catch (err) {
      console.error("Error handling CSV:", err);
      setErrorMessage("Error processing CSV file");
      setShowErrorPopup(true);
      setIsLoading(false);
    }

    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const filteredStudents = students.filter(student =>
    Object.values(student).some(value =>
      value && typeof value === 'string' && 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  return (
    <div className="department-container">
      <div className="adstd-container">
        <div className="adstd-content">
          <div className="adstd-card">
            <div className="adstd-header">
              <h2>Student Management System</h2>

              <div className="adstd-search-container">
                <Search className="adstd-search-icon" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search students..."
                  className="adstd-search-input"
                />
              </div>

              <div className="adstd-action-buttons">
                <button onClick={() => setShowAddModal(true)} className="adstd-btn adstd-btn-green">
                  <UserPlus size={18} />
                  <span>Add Student</span>
                </button>

                <div className="adstd-csv-upload">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    id="csvUpload"
                    className="adstd-csv-input"
                    ref={fileInputRef}
                  />
                  <label htmlFor="csvUpload" className="adstd-btn adstd-btn-blue">
                    <UploadCloud size={18} />
                    <span>Upload CSV</span>
                  </label>
                </div>

                <button
                  onClick={() => setShowStudents(!showStudents)}
                  className={`adstd-btn ${showStudents ? 'adstd-btn-purple' : 'adstd-btn-gray'}`}
                >
                  {showStudents ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span>{showStudents ? 'Hide Students' : 'Show Students'}</span>
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="adstd-loading">
                <p>Processing request...</p>
              </div>
            )}

            <div className={`adstd-students-table-container ${showStudents ? 'adstd-show' : 'adstd-hide'}`}>
              {!isLoading && filteredStudents.length === 0 ? (
                <div className="adstd-no-students">
                  <p>No students found</p>
                </div>
              ) : (
                <div className="adstd-table-wrapper">
                  <table className="adstd-students-table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td>{student.rollNumber}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="adstd-delete-btn"
                              aria-label="Delete student"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {showAddModal && (
              <div className="adstd-modal-overlay">
                <div className="adstd-modal">
                  <div className="adstd-modal-header">
                    <h2>Add New Student</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="adstd-close-btn"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="adstd-modal-form">
                    <div className="adstd-form-fields">
                      <div className="adstd-form-group">
                        <label htmlFor="name">Student Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter student name"
                        />
                      </div>

                      <div className="adstd-form-group">
                        <label htmlFor="rollNumber">Roll Number</label>
                        <input
                          type="text"
                          id="rollNumber"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleInputChange}
                          placeholder="Enter roll number"
                        />
                      </div>

                      <div className="adstd-form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div className="adstd-modal-actions">
                      <button type="submit" className="adstd-btn adstd-btn-green">
                        Add Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="adstd-btn adstd-btn-gray"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showErrorPopup && (
              <div className="adstd-error-popup">
                <div className="adstd-error-content">
                  <p>{errorMessage}</p>
                  <button
                    onClick={() => setShowErrorPopup(false)}
                    className="adstd-btn adstd-btn-gray"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;