import React, { useState, useEffect } from 'react';
import { X, Pencil, Trash2, AlertCircle, Upload, Camera, User } from 'lucide-react';
import './Addteacher.css';

const API_URL = "http://localhost:5000/api";

function AddTeacher({ setcomp }) {
  const [teachers, setTeachers] = useState([]);
  const [currentTeacher, setCurrentTeacher] = useState({
    name: "",
    email: "",
    qualifications: "",
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    teacher: null
  });
  const [inputName, setInputName] = useState('');
  const [deleteError, setDeleteError] = useState(false);

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    
    if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
      return photoPath;
    }
   
    return `http://localhost:5000${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const programId = sessionStorage.getItem("currentProgramId") || "demo-program";
      if (!programId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/teachers/program/${programId}`);
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        const mockTeachers = [
          {
            _id: "1",
            name: "Dr. Sarah Johnson",
            email: "sarah.johnson@example.com",
            qualifications: "Ph.D. in Computer Science",
            photo: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          },
          {
            _id: "2",
            name: "Prof. Michael Chen",
            email: "michael.chen@example.com",
            qualifications: "M.Sc. in Mathematics, 10+ years experience",
            photo: null
          }
        ];
        
        setTeachers(mockTeachers);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Failed to load teachers. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const programId = sessionStorage.getItem("currentProgramId") || "demo-program";
    
    if (!currentTeacher.name) {
      setError("Teacher name is required");
      return;
    }
    
    try {
      if (!programId) {
        setError("No program selected");
        return;
      }

      const formData = new FormData();
      formData.append('name', currentTeacher.name);
      formData.append('email', currentTeacher.email || '');
      formData.append('qualifications', currentTeacher.qualifications || '');
      formData.append('programId', programId);
      
      if (currentTeacher.photo) {
        formData.append('photo', currentTeacher.photo);
      }

      let updatedTeacher;
      
      if (editMode && editId !== null) {
        const response = await fetch(`${API_URL}/teachers/${editId}`, {
          method: 'PUT',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          updatedTeacher = data;
          
          const existingTeacher = teachers.find(t => t._id === editId);
          updatedTeacher = {
            _id: editId,
            ...currentTeacher,
            photo: data.photo || (photoPreview && !photoPreview.startsWith('data:') ? photoPreview : existingTeacher?.photo || null)
          };
          
          const updatedTeachers = teachers.map(teacher => 
            teacher._id === editId ? updatedTeacher : teacher
          );
          setTeachers(updatedTeachers);
        } else {
          throw new Error("Failed to update teacher");
        }
        
        setEditMode(false);
        setEditId(null);
      } else {
        const response = await fetch(`${API_URL}/teachers`, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          
          updatedTeacher = {
            _id: data._id || Math.random().toString(36).substring(2, 9),
            name: currentTeacher.name,
            email: currentTeacher.email,
            qualifications: currentTeacher.qualifications,
            photo: data.photo || null
          };
          
          setTeachers([...teachers, updatedTeacher]);
        } else {
          throw new Error("Failed to create teacher");
        }
      }
      
      setCurrentTeacher({ name: "", email: "", qualifications: "", photo: null });
      setPhotoPreview(null);
      setError("");
    } catch (err) {
      console.error("Error saving teacher:", err);
      setError(err.response?.data?.message || "Failed to save teacher. Please try again.");
    }
  };

  const handleEdit = (teacher) => {
    const photoUrl = getPhotoUrl(teacher.photo);
    
    setCurrentTeacher({
      name: teacher.name,
      email: teacher.email || "",
      qualifications: teacher.qualifications || "",
      photo: null 
    });
    setPhotoPreview(photoUrl);
    setEditMode(true);
    setEditId(teacher._id);
  };

  const handleDelete = async (id) => {
    try {
      const programId = sessionStorage.getItem("currentProgramId") || "demo-program";
      
      await fetch(`${API_URL}/teachers/${id}?programId=${programId}`, {
        method: 'DELETE'
      });
      
      setTeachers(teachers.filter(teacher => teacher._id !== id));
      closeDeleteModal();
    } catch (err) {
      setError("Failed to delete teacher.");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should not exceed 5MB");
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG and GIF images are allowed");
        return;
      }
      
      setCurrentTeacher({ ...currentTeacher, photo: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setCurrentTeacher({ ...currentTeacher, photo: null });
    setPhotoPreview(null);
  };

  const openDeleteModal = (teacher) => {
    setDeleteModal({
      isOpen: true,
      teacher: teacher
    });
    setInputName('');
    setDeleteError(false);
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      teacher: null
    });
    setInputName('');
    setDeleteError(false);
  };

  const handleConfirmDelete = () => {
    if (inputName === deleteModal.teacher.name) {
      handleDelete(deleteModal.teacher._id);
    } else {
      setDeleteError(true);
    }
  };

  const handleCancel = () => {
    setCurrentTeacher({ name: "", email: "", qualifications: "", photo: null });
    setPhotoPreview(null);
    setEditMode(false);
    setEditId(null);
  };

  if (loading) {
    return <div className="loading">Loading teachers...</div>;
  }

  return (
    <div className="adt-container">
       <button 
          className="back-botn"
          onClick={() => setcomp("Programs")}
        >
          ← 
        </button>
      
      <div className="adt-add-section">
        <h2>{editMode ? "Edit Teacher Profile" : "Add New Teacher"}</h2>
        <form onSubmit={handleSubmit} className="adt-form" encType="multipart/form-data">
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="adt-form-layout">
            <div className="adt-photo-section">
              <div className="photo-upload-container">
                {photoPreview ? (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Teacher" />
                    <button 
                      type="button" 
                      className="remove-photo-btn" 
                      onClick={removePhoto}
                      aria-label="Remove photo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <User size={50} />
                  </div>
                )}
                
                <div className="photo-upload-actions">
                  <label className="photo-upload-btn">
                    <Camera size={16} />
                    <span>{photoPreview ? "Change Photo" : "Upload Photo"}</span>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif" 
                      onChange={handlePhotoChange} 
                      className="hidden-input" 
                    />
                  </label>
                  <p className="photo-help">JPG, PNG or GIF (Max 5MB)</p>
                </div>
              </div>
            </div>
            
            <div className="adt-form-fields">
              <div className="adt-input-group">
                <label className="adt-label">Teacher Name</label>
                <input
                  type="text"
                  className="adt-input"
                  placeholder="Enter teacher name"
                  value={currentTeacher.name}
                  onChange={(e) =>
                    setCurrentTeacher({ ...currentTeacher, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="adt-input-group">
                <label className="adt-label">Email (Optional)</label>
                <input
                  type="email"
                  className="adt-input"
                  placeholder="Enter email"
                  value={currentTeacher.email}
                  onChange={(e) =>
                    setCurrentTeacher({ ...currentTeacher, email: e.target.value })
                  }
                />
              </div>

              <div className="adt-input-group">
                <label className="adt-label">Qualifications (Optional)</label>
                <input
                  type="text"
                  className="adt-input"
                  placeholder="Enter qualifications"
                  value={currentTeacher.qualifications}
                  onChange={(e) =>
                    setCurrentTeacher({ ...currentTeacher, qualifications: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="adt-form-actions">
            <button type="submit" className="adt-button adt-submit-btn">
              {editMode ? "Update Teacher" : "Add Teacher"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={handleCancel}
                className="adt-button adt-cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="adt-table">
        <h2>Teachers Directory</h2>
        <div className="adt-table-container">
          <table>
            <thead>
              <tr>
                <th className="photo-column">Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Qualifications</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="photo-column">
                    <div className="teacher-photo">
                      {teacher.photo ? (
                        <img src={getPhotoUrl(teacher.photo)} alt={teacher.name} />
                      ) : (
                        <div className="teacher-photo-placeholder">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{teacher.name}</td>
                  <td>{teacher.email || "-"}</td>
                  <td>{teacher.qualifications || "-"}</td>
                  <td>
                    <div className="adt-button-group">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="adt-button adt-view-btn"
                        aria-label="Edit teacher"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(teacher)}
                        className="adt-button adt-delete-btn"
                        aria-label="Delete teacher"
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

      {deleteModal.isOpen && (
        <div className="adt-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Confirm Deletion</h2>
            <div className="delete-modal-body">
              <div className="delete-warning">
                <AlertCircle size={24} />
                <p>You are about to delete the following teacher:</p>
              </div>
              
              <div className="teacher-to-delete">
                <p><strong>{deleteModal.teacher.name}</strong></p>
              </div>
              
              <p className="confirmation-instruction">
                To confirm deletion, please type the teacher's name below:
              </p>
              
              <input
                type="text"
                className={`delete-confirmation-input ${deleteError ? 'error' : ''}`}
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  setDeleteError(false);
                }}
                placeholder="Type teacher name"
                autoFocus
              />
              
              {deleteError && (
                <p className="name-error">
                  The name you entered doesn't match the teacher's name.
                </p>
              )}
            </div>
            
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button 
                className={`confirm-delete-btn ${inputName === deleteModal.teacher.name ? 'enabled' : 'disabled'}`}
                onClick={handleConfirmDelete}
                disabled={inputName !== deleteModal.teacher.name}
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

export default AddTeacher;