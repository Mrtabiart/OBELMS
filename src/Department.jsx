import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Pencil, Trash2, AlertCircle } from 'lucide-react';
import './Department.css';

function Department({ setcomp }) {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    hodName: ''
  });
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    department: null
  });
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/departments');
        setDepartments(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartment.name || !newDepartment.hodName) return;
    
    try {
      const res = await axios.post('http://localhost:5000/api/departments', newDepartment);
      setDepartments([...departments, res.data]);
      setNewDepartment({ name: '', hodName: '' });
    } catch (err) {
      console.error('Error adding department:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/departments/${id}`);
      setDepartments(departments.filter(dept => dept._id !== id));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting department:', err);
    }
  };

  const openDeleteModal = (dept) => {
    setDeleteModal({
      isOpen: true,
      department: dept
    });
    setInputName('');
    setError(false);
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      department: null
    });
    setInputName('');
    setError(false);
  };

  const handleConfirmDelete = () => {
    if (inputName === deleteModal.department?.name) {
      handleDelete(deleteModal.department._id);
    } else {
      setError(true);
    }
  };

  const handleUpdate = async (id, updatedName, updatedHod) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/departments/${id}`, {
        name: updatedName,
        hodName: updatedHod
      });
      
      setDepartments(departments.map(dept => 
        dept._id === id ? res.data : dept
      ));
    } catch (err) {
      console.error('Error updating department:', err);
    }
  };

  const handleView = (dept) => {
    setSelectedDepartment(dept);
  };

  const closeView = () => {
    setSelectedDepartment(null);
  };

  const viewPrograms = (deptId) => {
    sessionStorage.setItem('currentDepartmentId', deptId);
    setcomp("Programs");
  };

  if (loading) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div className="department-container">
      <div className="add-department-section">
        <h2>Add New Department</h2>
        <form onSubmit={handleAddDepartment}>
          <input
            type="text"
            placeholder="Department Name"
            value={newDepartment.name}
            onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="HOD Name"
            value={newDepartment.hodName}
            onChange={(e) => setNewDepartment({ ...newDepartment, hodName: e.target.value })}
          />
          <button type="submit">Add Department</button>
        </form>
      </div>
      
      <div className="department-stats">
        <h3>Total Departments: {departments.length}</h3>
        <p>Managing academic excellence across departments</p>
      </div>

      <div className="department-table">
        <h2>Department List</h2>
        <div className="dep-table-container">
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>HOD Name</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept._id} className='deptabletrans'>
                  <td>{dept.name}</td>
                  <td>{dept.hodName}</td>
                  <td>
                    <div className="Dep-button-group">
                      <button 
                        className="view-btn"
                        style={{ padding: '10px 20px' }}
                        onClick={() => viewPrograms(dept._id)}
                      >
                        View Programs
                      </button>
                      <button 
                        className="view-details-btn"
                        onClick={() => handleView(dept)}
                      >
                        View Details
                      </button>
                      <button 
                        className="update-btn"
                        onClick={() => {
                          const newName = prompt('Enter new department name:', dept.name);
                          const newHod = prompt('Enter new HOD name:', dept.hodName);
                          if (newName && newHod) {
                            handleUpdate(dept._id, newName, newHod);
                          }
                        }}
                      >
                        <Pencil size={19} />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => openDeleteModal(dept)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDepartment && (
        <div className="modal-overlay" onClick={closeView}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Department Details</h2>
            <div className="modal-body">
              <p><strong>Department Name:</strong> {selectedDepartment.name}</p>
              <p><strong>HOD Name:</strong> {selectedDepartment.hodName}</p>
              <p><strong>Created on:</strong> {new Date(selectedDepartment.createdAt).toLocaleDateString()}</p>
            </div>
            <button className="close-btn" onClick={closeView}>Close</button>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Confirm Deletion</h2>
            <div className="delete-modal-body">
              <div className="delete-warning">
                <AlertCircle size={24} color="#f44336" />
                <p>You are about to delete the following department:</p>
              </div>
              
              <div className="department-to-delete">
                <p><strong>{deleteModal.department?.name}</strong></p>
              </div>
              
              <p className="confirmation-instruction">
                To confirm deletion, please type the department name below:
              </p>
              
              <input
                type="text"
                className={`delete-confirmation-input ${error ? 'error' : ''}`}
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  setError(false);
                }}
                placeholder="Type department name"
                autoFocus
              />
              
              {error && (
                <p className="name-error">
                  The name you entered doesn't match the department name.
                </p>
              )}
            </div>
            
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button 
                className={`confirm-delete-btn ${inputName === deleteModal.department?.name ? 'enabled' : 'disabled'}`}
                onClick={handleConfirmDelete}
                disabled={inputName !== deleteModal.department?.name}
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

export default Department;