import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, ArrowLeft, AlertCircle, Eye, Pencil, Trash2, Layers, Users } from 'lucide-react';
import './Program.css';

function Programs({ setcomp }) {
  const [programs, setPrograms] = useState([]);
  const [department, setDepartment] = useState(null);
  const [newProgram, setNewProgram] = useState({
    name: '',
    coordinatorName: '',
    plos: []
  });
  const [currentPlo, setCurrentPlo] = useState({
    number: '',
    description: ''
  });
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    program: null
  });
  const [inputName, setInputName] = useState('');
  const [deleteError, setDeleteError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [programToUpdate, setProgramToUpdate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentId = sessionStorage.getItem('currentDepartmentId');
        
        if (!departmentId) {
          setLoading(false);
          return;
        }
        
        const deptRes = await axios.get(`http://localhost:5000/api/departments/${departmentId}`);
        setDepartment(deptRes.data);
        
        const progRes = await axios.get(`http://localhost:5000/api/programs/department/${departmentId}`);
        setPrograms(progRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddPlo = (e) => {
    e.preventDefault();
    if (!currentPlo.number || !currentPlo.description) {
      setError('Please fill in both PLO number and description');
      return;
    }

    setNewProgram({
      ...newProgram,
      plos: [...newProgram.plos, { ...currentPlo }]
    });
    setCurrentPlo({ number: '', description: '' });
    setError('');
  };

  const handleRemovePlo = (index) => {
    setNewProgram({
      ...newProgram,
      plos: newProgram.plos.filter((_, i) => i !== index)
    });
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!newProgram.name || !newProgram.coordinatorName || newProgram.plos.length === 0) {
      setError('Please fill in all fields and add at least one PLO');
      return;
    }
    
    const departmentId = sessionStorage.getItem('currentDepartmentId');
    if (!departmentId) {
      setError('No department selected');
      return;
    }
    
    try {
      const res = await axios.post('http://localhost:5000/api/programs', {
        ...newProgram,
        departmentId
      });
      
      setPrograms([...programs, res.data]);
      setNewProgram({ name: '', coordinatorName: '', plos: [] });
      setError('');
    } catch (err) {
      console.error('Error adding program:', err);
      setError('Failed to add program. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/programs/${id}`);
      setPrograms(programs.filter(prog => prog._id !== id));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Failed to delete program. Please try again.');
    }
  };

  const openDeleteModal = (prog) => {
    setDeleteModal({
      isOpen: true,
      program: prog
    });
    setInputName('');
    setDeleteError(false);
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      program: null
    });
    setInputName('');
    setDeleteError(false);
  };

  const handleConfirmDelete = () => {
    if (inputName === deleteModal.program.name) {
      handleDelete(deleteModal.program._id);
    } else {
      setDeleteError(true);
    }
  };

  const handleUpdateClick = (program) => {
    setProgramToUpdate(program);
    setNewProgram({
      name: program.name,
      coordinatorName: program.coordinatorName,
      plos: [...program.plos]
    });
    setIsUpdating(true);
    window.scrollTo(0, 0); 
  };

  const handleCancelUpdate = () => {
    setIsUpdating(false);
    setProgramToUpdate(null);
    setNewProgram({
      name: '',
      coordinatorName: '',
      plos: []
    });
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    if (!newProgram.name || !newProgram.coordinatorName || newProgram.plos.length === 0) {
      setError('Please fill in all fields and add at least one PLO');
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/programs/${programToUpdate._id}`, {
        name: newProgram.name,
        coordinatorName: newProgram.coordinatorName,
        plos: newProgram.plos
      });
      
      setPrograms(programs.map(prog => 
        prog._id === programToUpdate._id ? res.data : prog
      ));
      
      setIsUpdating(false);
      setProgramToUpdate(null);
      setNewProgram({ name: '', coordinatorName: '', plos: [] });
      setError('');
    } catch (err) {
      console.error('Error updating program:', err);
      setError('Failed to update program. Please try again.');
    }
  };

  const handleUpdate = async (id, updatedName, updatedCoordinator) => {
    try {
      const program = programs.find(p => p._id === id);
      if (!program) return;
      
      const res = await axios.put(`http://localhost:5000/api/programs/${id}`, {
        name: updatedName,
        coordinatorName: updatedCoordinator,
        plos: program.plos
      });
      
      setPrograms(programs.map(prog => 
        prog._id === id ? res.data : prog
      ));
    } catch (err) {
      console.error('Error updating program:', err);
      setError('Failed to update program. Please try again.');
    }
  };

  const handleView = (prog) => {
    setSelectedProgram(prog);
  };

  const closeView = () => {
    setSelectedProgram(null);
  };

  if (loading) {
    return <div className="loading">Loading programs...</div>;
  }

  if (!department) {
    return (
      <div className="department-container">
        <div className="alert-message">
          <p>No department selected. Please select a department first.</p>
          <button 
            className="back-botn"
            onClick={() => setcomp("Department")}
          >
            <ArrowLeft size={16} /> Back to Departments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="department-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="program-header">
        <button 
          className="back-botn"
          onClick={() => setcomp("Department")}
        >
          ←
        </button>
      </div>
      
      <div className="form-section">
        <h2 className="subjecth2">{isUpdating ? 'Update Program' : 'Add New Program'}</h2>
        <form onSubmit={isUpdating ? handleUpdateProgram : handleAddProgram} className="program-form">
          <div className="program-input-row">
            <div className="program-input-group">
              <input
                id="programName"
                type="text"
                placeholder="Program Name"
                value={newProgram.name}
                onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="program-input-group">
              <input
                id="coordinatorName"
                type="text"
                placeholder="Coordinator Name"
                value={newProgram.coordinatorName}
                onChange={(e) => setNewProgram({ ...newProgram, coordinatorName: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          
          <h3 className="ploh3">Add PLOs</h3>
          <div className="program-plo-inputs">
            <div className="program-plo-input-row">
              <div className="program-input-group">
                <label htmlFor="ploNumber" className="program-label">PLO Number</label>
                <input
                  id="ploNumber"
                  type="text"
                  placeholder="PLO-1 e.g"
                  value={currentPlo.number}
                  onChange={(e) => setCurrentPlo({ ...currentPlo, number: e.target.value })}
                  className="program-input program-plo-number-input"
                />
              </div>
              <button 
                type="button" 
                className="program-button program-add-plo-btn"
                onClick={handleAddPlo}
              >
                <Plus size={20} className="program-add-icon" />
                Add PLO
              </button>
            </div>
            <div className="program-input-group">
              <label htmlFor="ploDescription" className="program-label">PLO Description</label>
              <textarea
                id="ploDescription"
                placeholder="Enter PLO description"
                value={currentPlo.description}
                onChange={(e) => setCurrentPlo({ ...currentPlo, description: e.target.value })}
                className="program-plo-textarea"
                rows={3}
              />
            </div>
          </div>

          {newProgram.plos.length > 0 && (
            <div className="program-plos-preview">
              <h4>Added PLOs:</h4>
              {newProgram.plos.map((plo, index) => (
                <div key={index} className="program-plo-preview-item">
                  <div className="program-plo2-row">
                    <span className="program-plo-number">{plo.number}</span>
                    <p className="program-plo-description">{plo.description}</p>
                    <button 
                      type="button" 
                      className="program-remove-plo-btn"
                      onClick={() => handleRemovePlo(index)}
                      aria-label="Remove PLO"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="form-buttons">
            {isUpdating ? (
              <>
               <div className="button-group">
               <button 
                  type="submit" 
                  className="submit-btn"
                >
                  Update Program
                </button>
                <button 
                  type="button" 
                   className="cancel-btn"
                  onClick={handleCancelUpdate}
                >
                  Cancel
                </button>
               </div>
              </>
            ) : (
              <button 
                type="submit" 
                className="program-button program-submit-btn"
              >
                Save Program
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="program-stats">
        <h3>Total Programs: {programs.length}</h3>
        <p>Managing academic excellence across programs</p>
      </div>

      <div className="program-table">
        <h2>Program List</h2>
        <div className="program-table-container">
          <table>
            <thead>
              <tr>
                <th>Program Name</th>
                <th>Coordinator Name</th>
                <th>PLOs</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(prog => (
                <tr key={prog._id}>
                  <td>{prog.name}</td>
                  <td>{prog.coordinatorName}</td>
                  <td>
                    <button 
                      className="program-button program-view-plos-btn"
                      onClick={() => handleView(prog)}
                    >
                      PLO'S : ({prog.plos.length})
                    </button>
                  </td>
                  <td>
                    <div className="program-button-group">
                      <button 
                        className="program-button program-view-btn"
                        onClick={() => {
                          sessionStorage.setItem('currentProgramId', prog._id);
                          setcomp("Courses");
                        }}
                      >
                        Subjects
                      </button>
                      <button 
                        className="program-button program-update-btn"
                        onClick={() => handleUpdateClick(prog)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        className="program-button program-delete-btn"
                        onClick={() => openDeleteModal(prog)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="program-button program-semester-btn"
                        onClick={() => {
                          sessionStorage.setItem('currentProgramId', prog._id);
                          setcomp("Semester");
                        }}
                      >
                        Semesters
                      </button>
                      <button 
                        className="program-button program-teacher-btn"
                        onClick={() => {
                          sessionStorage.setItem('currentProgramId', prog._id);
                          setcomp("Addteacher");
                        }}
                      >
                        <Users size={16} />
                        Teachers
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProgram && (
        <div className="program-modal-overlay" onClick={closeView}>
          <div className="program-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Program Details</h2>
            <div className="program-modal-body">
              <p><strong>Program Name:</strong> {selectedProgram.name}</p>
              <p><strong>Coordinator Name:</strong> {selectedProgram.coordinatorName}</p>
              <div className="program-modal-plos">
                <h3>Program Learning Outcomes (PLOs)</h3>
                {selectedProgram.plos.map((plo, index) => (
                  <div key={index} className="program-modal-plo-item">
                    <div className="program-plo-row">
                      <span className="program-plo-number">{plo.number}</span>
                      <p className="program-plo-description">{plo.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              className="program-button program-close-btn"
              onClick={closeView}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="program-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Confirm Deletion</h2>
            <div className="delete-modal-body">
              <div className="delete-warning">
                <AlertCircle size={24} />
                <p>You are about to delete the following program:</p>
              </div>
              
              <div className="program-to-delete">
                <p><strong>{deleteModal.program.name}</strong></p>
              </div>
              
              <p className="confirmation-instruction">
                To confirm deletion, please type the program name below:
              </p>
              
              <input
                type="text"
                className={`delete-confirmation-input ${deleteError ? 'error' : ''}`}
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  setDeleteError(false);
                }}
                placeholder="Type program name"
                autoFocus
              />
              
              {deleteError && (
                <p className="name-error">
                  The name you entered doesn't match the program name.
                </p>
              )}
            </div>
            
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button 
                className={`confirm-delete-btn ${inputName === deleteModal.program.name ? 'enabled' : 'disabled'}`}
                onClick={handleConfirmDelete}
                disabled={inputName !== deleteModal.program.name}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Programs;