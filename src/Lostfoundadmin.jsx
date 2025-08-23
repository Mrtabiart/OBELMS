import { useState, useEffect } from 'react';
import './Lostfound.css'; 

function Lostfoundadmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    color: '',
    location: '',
    dateFound: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadItems();
  }, [selectedFilter]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const filterParam = selectedFilter !== 'all' ? `?filter=${selectedFilter}` : '';
      const response = await fetch(`${API_BASE_URL}/api/lostfound${filterParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to load items. Please try again later.');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/lostfound`, {
        method: 'POST',
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      
      setFormData({
        itemName: '',
        category: '',
        color: '',
        location: '',
        dateFound: '',
        description: ''
      });
      setSelectedImage(null);
      setShowForm(false);
      await loadItems();
    } catch (err) {
      setError('Failed to add item. Please try again.');
      console.error('Error adding item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReturned = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lostfound/${id}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item status');
      }
      
      await loadItems();
    } catch (err) {
      setError('Failed to update item status. Please try again.');
      console.error('Error updating item:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lostfound/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete item');
        }
        
        await loadItems();
      } catch (err) {
        setError('Failed to delete item. Please try again.');
        console.error('Error deleting item:', err);
      }
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  return (
    <div className="lostfound-root">
      <div className="lostf-admin-container">
        <h2 className="lostf-admin-h2">Lost & Found Administration</h2>
        
        {error && <div className="lostf-error-message">{error}</div>}
        
        <div className="lostf-admin-actions">
          <button 
            className="lostf-btn lostf-btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Item'}
          </button>
        </div>
        
        {showForm && (
          <div className="lostf-form-container">
            <h3>Register New Found Item</h3>
            <form onSubmit={handleSubmit}>
              <div className="lostf-form-group">
                <label htmlFor="itemName">Item Name</label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Blue Backpack"
                />
              </div>
              
              <div className="lostf-form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="lostf-form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Blue"
                />
              </div>
              
              <div className="lostf-form-group">
                <label htmlFor="location">Where Found</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Library, 2nd floor"
                />
              </div>
              
              <div className="lostf-form-group">
                <label htmlFor="dateFound">Date Found</label>
                <input
                  type="date"
                  id="dateFound"
                  name="dateFound"
                  value={formData.dateFound}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="lostf-form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional details about the item..."
                ></textarea>
              </div>
              
              <div className="lostf-form-group">
                <label htmlFor="image">Image (Optional)</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              
              <div className="lostf-form-actions">
                <button type="submit" className="lostf-btn lostf-btn-success" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="lostf-items-section">
          
          <div className="lostf-filter-options">
            <button 
              className={`lostf-btn lostf-btn-filter ${selectedFilter === 'all' ? 'lostf-active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Items
            </button>
            <button 
              className={`lostf-btn lostf-btn-filter ${selectedFilter === 'claimed' ? 'lostf-active' : ''}`}
              onClick={() => handleFilterChange('claimed')}
            >
              Claimed Items
            </button>
            <button 
              className={`lostf-btn lostf-btn-filter ${selectedFilter === 'unclaimed' ? 'lostf-active' : ''}`}
              onClick={() => handleFilterChange('unclaimed')}
            >
              Unclaimed Items
            </button>
            <button 
              className={`lostf-btn lostf-btn-filter ${selectedFilter === 'returned' ? 'lostf-active' : ''}`}
              onClick={() => handleFilterChange('returned')}
            >
              Returned Items
            </button>
          </div>
          
          {loading && <div className="lostf-loading">Loading items...</div>}
          
          {!loading && items.length === 0 ? (
            <div className="lostf-empty-state">
              <p>No items have been registered yet.</p>
            </div>
          ) : (
            <div className="lostf-items-grid">
              {items.map(item => (
                <div 
                  key={item._id} 
                  className={`lostf-item-card ${item.isClaimed ? 'lostf-claimed' : ''} ${item.isReturned ? 'lostf-returned' : ''}`}
                >
                  <div className="lostf-item-image">
                    {item.image ? (
                      <img src={`${API_BASE_URL}${item.image}`} alt={item.itemName} />
                    ) : (
                      <div className="lostf-placeholder-image">No Image</div>
                    )}
                  </div>
                  <div className="lostf-item-details">
                    <h4 className="lostf-item-details-h4">{item.itemName}</h4>
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Color:</strong> {item.color}</p>
                    <p><strong>Location:</strong> {item.location}</p>
                    <p><strong>Found on:</strong> {new Date(item.dateFound).toLocaleDateString()}</p>
                    {item.description && <p><strong>Description:</strong> {item.description}</p>}
                    
                    <div className="lostf-item-status">
                      {item.isClaimed && (
                        <div>
                          <span className="lostf-status lostf-claimed">Claimed</span>
                          {item.claimedBy && (
                            <div className="lostf-claimer-info">
                              <p><strong>Claimed by:</strong> {item.claimedBy.name}</p>
                              <p><strong>Contact:</strong> {item.claimedBy.contact}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!item.isClaimed && <span className="lostf-status lostf-unclaimed">Unclaimed</span>}
                      
                      {item.isReturned && <span className="lostf-status lostf-returned">Returned to Owner</span>}
                    </div>
                    
                    <div className="lostf-item-actions">
                      {item.isClaimed && !item.isReturned && (
                        <button 
                          className="lostf-btn lostf-btn-success"
                          onClick={() => handleMarkAsReturned(item._id)}
                        >
                          Mark as Returned
                        </button>
                      )}
                      <button 
                        className="lostf-btn lostf-btn-danger"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lostfoundadmin;