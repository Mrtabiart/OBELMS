import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Plus, ArrowLeft, Edit, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import "./Subjectmap.css";

const API_URL = "http://localhost:5000/api";

const Subjectmap = ({ setcomp }) => {
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState({
    name: "",
    code: "",
    creditHours: "",
    isLab: false,
    clos: [],
  });
  
  const [currentClo, setCurrentClo] = useState({
    clonumber: "",
    passingPercentage: "",
    type: "",
    description: "",
    ploNumber: ""
  });
  
  // Set Cognitive as the default selected main type
  const [selectedMainType, setSelectedMainType] = useState("Cognitive");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    subject: null
  });
  const [inputName, setInputName] = useState('');
  const [deleteError, setDeleteError] = useState(false);

  const subTypes = {
    Cognitive: [
      { value: 'L1 Knowledge', label: 'L1 Knowledge' },
      { value: 'L2 Comprehension', label: 'L2 Comprehension' },
      { value: 'L3 Application', label: 'L3 Application' },
      { value: 'L4 Analysis', label: 'L4 Analysis' },
      { value: 'L5 Synthesis', label: 'L5 Synthesis' },
      { value: 'L6 Evaluation', label: 'L6 Evaluation' }
    ],
    Affective: [
      { value: 'L1 Receiving', label: 'L1 Receiving' },
      { value: 'L2 Responding', label: 'L2 Responding' },
      { value: 'L3 Valuing', label: 'L3 Valuing' },
      { value: 'L4 Organization', label: 'L4 Organization' },
      { value: 'L5 Internalizing', label: 'L5 Internalizing' }
    ],
    Psycomotor: [
      { value: 'L1 Perception', label: 'L1 Perception' },
      { value: 'L2 Se', label: 'L2 Set' },
      { value: 'L3 Guided Response', label: 'L3 Guided Response' },
      { value: 'L4 Mechanism', label: 'L4 Mechanism' },
      { value: 'L5 Overt Response', label: 'L5 Overt Response' },
      { value: 'L6 Adaption', label: 'L6 Adaption' },
      { value: 'L7 Organization', label: 'L7 Organization' }
    ]
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedMainType) {
      setSelectedSubType("");
      setCurrentClo(prev => ({ ...prev, type: "" }));
    }
  }, [selectedMainType]);

  const fetchSubjects = async () => {
    try {
      const programId = sessionStorage.getItem("currentProgramId");
      if (!programId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/subjects/program/${programId}`);
      setSubjects(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Failed to load subjects. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentSubject.name || !currentSubject.code || !currentSubject.creditHours) {
      setError("Subject name, code, and credit hours are required");
      return;
    }
    
    try {
      const programId = sessionStorage.getItem("currentProgramId");
      if (!programId) {
        setError("No program selected");
        return;
      }
  
      const subjectData = {
        ...currentSubject,
        programId,
        creditHours: Number(currentSubject.creditHours)
      };
      
      if (editMode && editIndex !== null) {
        const response = await axios.put(`${API_URL}/subjects/${subjects[editIndex]._id}`, subjectData);
        const updatedSubjects = [...subjects];
        updatedSubjects[editIndex] = response.data;
        setSubjects(updatedSubjects);
        setEditMode(false);
        setEditIndex(null);
      } else {
        const response = await axios.post(`${API_URL}/subjects`, subjectData);
        setSubjects([...subjects, response.data]);
      }
      
      setCurrentSubject({ name: "", code: "", creditHours: "", isLab: false, clos: [] });
      setError("");
    } catch (err) {
      console.error("Error saving subject:", err);
      setError(err.response?.data?.message || "Failed to save subject. Please try again.");
    }
  };

  const addMapping = () => {
    if (!currentClo.clonumber || !currentClo.passingPercentage || !selectedMainType || !selectedSubType || !currentClo.description || !currentClo.ploNumber) {
      setError("All CLO fields are required");
      return;
    }
    
   
    const combinedType = `${selectedMainType} (${selectedSubType})`;
    
    setCurrentSubject({
      ...currentSubject,
      clos: [...currentSubject.clos, { 
        ...currentClo,
        type: combinedType 
      }],
    });
    
    setCurrentClo({ 
      clonumber: "", 
      passingPercentage: "", 
      type: "", 
      description: "", 
      ploNumber: "" 
    });
    
   
    
    setError("");
  };

  const removeMapping = (index) => {
    const newClos = currentSubject.clos.filter((_, i) => i !== index);
    setCurrentSubject({ ...currentSubject, clos: newClos });
  };

  const handleEdit = (index) => {
    setCurrentSubject({ 
      ...subjects[index],
      creditHours: subjects[index].creditHours || "",
      isLab: subjects[index].isLab || false  
    });
    setEditMode(true);
    setEditIndex(index);
    setExpandedSubject(null);
    
  
    setSelectedMainType("Cognitive");
    setSelectedSubType("");
  };

  const handleDelete = async (subjectId) => {
    try {
      await axios.delete(`${API_URL}/subjects/${subjectId}`);
      setSubjects(subjects.filter(subject => subject._id !== subjectId));
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting subject:", err);
      setError("Failed to delete subject. Please try again.");
    }
  };

  const openDeleteModal = (subject) => {
    setDeleteModal({
      isOpen: true,
      subject: subject
    });
    setInputName('');
    setDeleteError(false);
  };
  
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      subject: null
    });
    setInputName('');
    setDeleteError(false);
  };
  
  const handleConfirmDelete = () => {
    if (inputName === deleteModal.subject?.name) {
      handleDelete(deleteModal.subject._id);
    } else {
      setDeleteError(true);
    }
  };

  const toggleExpand = (index) => {
    setExpandedSubject(expandedSubject === index ? null : index);
  };

  const handleCancel = () => {
    setCurrentSubject({ name: "", code: "", creditHours: "", isLab: false, clos: [] });
    setEditMode(false);
    setEditIndex(null);
    // Reset to Cognitive as default
    setSelectedMainType("Cognitive");
    setSelectedSubType("");
  };

  const handleMainTypeChange = (e) => {
    setSelectedMainType(e.target.value);
  };

  const handleSubTypeChange = (e) => {
    setSelectedSubType(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading subjects...</div>;
  }

  return (
    <div className="subject-container">
      {deleteModal.isOpen && (
        <div className="subject-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Confirm Deletion</h2>
            <div className="delete-modal-body">
              <div className="delete-warning">
                <AlertCircle size={24} />
                <p>You are about to delete the following subject:</p>
              </div>
              
              <div className="subject-to-delete">
                <p><strong>{deleteModal.subject?.name}</strong></p>
              </div>
              
              <p className="confirmation-instruction">
                To confirm deletion, please type the subject's Code below:
              </p>
              
              <input
                type="text"
                className={`delete-confirmation-input ${deleteError ? 'error' : ''}`}
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  setDeleteError(false);
                }}
                placeholder="Type subject name"
                autoFocus
              />
              
              {deleteError && (
                <p className="name-error">
                  The name you entered doesn't match the subject's name.
                </p>
              )}
            </div>
            
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button 
                className={`confirm-delete-btn ${inputName === deleteModal.subject?.name ? 'enabled' : 'disabled'}`}
                onClick={handleConfirmDelete}
                disabled={inputName !== deleteModal.subject?.name}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="back-botn" onClick={() => setcomp("Programs")}>
        ←
      </button>
      
      <div className="form-section">
        <h2 className="subjecth2">
          {editMode ? "Edit Subject" : "Add New Subject"}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="lab-checkbox-container">
            <label className="lab-checkbox-label">
              <input
                type="checkbox"
                checked={currentSubject.isLab}
                onChange={(e) => 
                  setCurrentSubject({ ...currentSubject, isLab: e.target.checked })
                }
                className="lab-checkbox"
              />
              Lab
            </label>
          </div>
          
          <div className="input-groupp">
            <input
              type="text"
              placeholder="Subject Name"
              value={currentSubject.name}
              onChange={(e) =>
                setCurrentSubject({ ...currentSubject, name: e.target.value })
              }
              className="form-input"
            />
            <input
              type="text"
              placeholder="Subject Code"
              value={currentSubject.code}
              onChange={(e) =>
                setCurrentSubject({ ...currentSubject, code: e.target.value })
              }
              className="form-input"
            />
            <input
              type="number"
              placeholder="Credit Hours"
              value={currentSubject.creditHours}
              onChange={(e) =>
                setCurrentSubject({ ...currentSubject, creditHours: e.target.value })
              }
              className="form-input"
              min="1"
              max="6" 
            />
          </div>

          <div className="mapping-section">
            <h2 className="subjecth2">CLO-PLO Mapping</h2>
            <div className="mapping-inputs">
              <input
                type="text"
                placeholder="CLO Number"
                value={currentClo.clonumber}
                onChange={(e) => setCurrentClo({ ...currentClo, clonumber: e.target.value })}
                className="form-input"
              /> 
              <input
                type="text"
                placeholder="CLO Passing Percentage"
                value={currentClo.passingPercentage}
                onChange={(e) => setCurrentClo({ ...currentClo, passingPercentage: e.target.value })}
                className="form-input"
              />
              <input
                type="text"
                placeholder="PLO Number"
                value={currentClo.ploNumber}
                onChange={(e) => setCurrentClo({ ...currentClo, ploNumber: e.target.value })}
                className="form-input"
              />
              <select
                value={selectedMainType}
                onChange={handleMainTypeChange}
                className="form-input"
              >
                <option value="Cognitive">Cognitive</option>
                <option value="Affective">Affective</option>
                <option value="Psycomotor">Psycomotor</option>
              </select>
            </div>
            
            {selectedMainType && (
              <div className="mapping-inputs" style={{ marginTop: '10px' }}>
                <select
                  value={selectedSubType}
                  onChange={handleSubTypeChange}
                  className="form-input"
                >
                  <option value="">Select {selectedMainType} Subtype</option>
                  {subTypes[selectedMainType]?.map((subType) => (
                    <option key={subType.value} value={subType.value}>
                      {subType.label}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={addMapping}
                  className="add-mapping-btn"
                >
                  <Plus size={16} /> Add Mapping
                </button>
              </div>
            )}
            
            <div className="mapping-inputs">
              <textarea
                placeholder="CLO Description"
                value={currentClo.description}
                onChange={(e) => setCurrentClo({ ...currentClo, description: e.target.value })}
                className="form-input clo-description clodes"
                rows={3}
              />
            </div>
            <div className="mappings-list">
              {currentSubject.clos.map((clo, index) => (
                <div key={index} className="mapping-item">
                  <span>
                    CLO: {clo.clonumber} → PLO: {clo.ploNumber} → Type: {clo.type} → Passing: {clo.passingPercentage}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMapping(index)}
                    className="remove-btn"
                    aria-label="Remove mapping"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="submit-btn">
              {editMode ? "Update Subject" : "Save Subject"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="subjects-list">
        <div className="department-stats">
          {subjects.length === 0 ? (
            <h3>Program Courses: <p>No courses added</p></h3>
          ) : (
            <h3>Program Courses: {subjects.length}</h3>
          )}
        </div>
        {subjects.map((subject, index) => (
          <div key={index} className="subject-card">
            <div className="subject-header">
              <div className="subject-title">
                <h3 className="subjecth2">
                  {subject.isLab && <span className="lab-badge">Lab</span>} {subject.name} ({subject.code}) - {subject.creditHours} Credit-Hours
                </h3>
              </div>
              <div className="subject-actions">
                <button
                  onClick={() => toggleExpand(index)}
                  className="action-btn view-btn"
                >
                  <span className="btn-content">
                    {expandedSubject === index ? (
                      <>
                        <ChevronUp size={16} />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        View
                      </>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => handleEdit(index)}
                  className="action-btn edit-btn"
                >
                  <span className="btn-content">
                    <Edit size={16} />
                    Edit
                  </span>
                </button>
                <button
                  onClick={() => openDeleteModal(subject)}
                  className="action-btn delete-btn"
                >
                  <span className="btn-content">
                    <Trash2 size={16} />
                    Delete
                  </span>
                </button>
              </div>
            </div>
            {expandedSubject === index && (
              <div className="mappings">
                <h4>CLO-PLO Mappings:</h4>
                {subject.clos.length > 0 ? (
                  <div className="clo-mappings-table">
                    <table style={{ 
                      width: '100%',
                      borderCollapse: 'collapse',
                    }}>
                      <thead>
                        <tr>
                          <th>CLO</th>
                          <th>PLO</th>
                          <th>Type</th>
                          <th>Passing %</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subject.clos.map((clo, mIndex) => (
                          <tr key={mIndex}>
                            <td>{clo.clonumber}</td>
                            <td>{clo.ploNumber}</td>
                            <td>{clo.type}</td>
                            <td>{clo.passingPercentage}</td>
                            <td className="clo-description-cell">{clo.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-mappings">No mappings available</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjectmap;