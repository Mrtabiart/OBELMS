import { useState, useEffect } from 'react'
// import { fetchItems, claimItem } from '../api/lostItemsApi'
import './Lostfound.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Lostfoundstudent() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [claimData, setClaimData] = useState({
    itemId: null,
    name: '',
    contact: '',
    details: ''
  })
  const [showClaimModal, setShowClaimModal] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/lostfound`)
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      const data = await response.json()
      // Filter out items that have already been returned
      const activeItems = data.filter(item => !item.isReturned)
      setItems(activeItems)
      setError(null)
    } catch (err) {
      setError('Failed to load items. Please try again later.')
      console.error('Error loading items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value)
  }

  const handleOpenClaimModal = (itemId) => {
    setClaimData({
      ...claimData,
      itemId
    })
    setShowClaimModal(true)
  }

  const handleClaimInputChange = (e) => {
    const { name, value } = e.target
    setClaimData({
      ...claimData,
      [name]: value
    })
  }

  const handleSubmitClaim = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/lostfound/${claimData.itemId}/claim`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: claimData.name,
          contact: claimData.contact,
          details: claimData.details
        })
      })

      if (!response.ok) {
        throw new Error('Failed to claim item')
      }

      setShowClaimModal(false)
      setClaimData({
        itemId: null,
        name: '',
        contact: '',
        details: ''
      })
      await loadItems()
    } catch (err) {
      setError('Failed to claim item. Please try again.')
      console.error('Error claiming item:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter items based on search term and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="lostf-admin-container">
      <h2 className="lostf-admin-h2">Found Items</h2>
      
      {error && <div className="lostf-error-message">{error}</div>}
      
      <div className="lostf-search-filters">
        <div className="lostf-search-box">
          <input
            type="text"
            placeholder="Search by name, description or location..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="lostf-category-filter">
          <select value={categoryFilter} onChange={handleCategoryFilter}>
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Books">Books</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      {loading && <div className="lostf-loading">Loading items...</div>}
      
      {!loading && filteredItems.length === 0 ? (
        <div className="lostf-empty-state">
          <p>No items found matching your criteria.</p>
        </div>
      ) : (
        <div className="lostf-items-grid">
          {filteredItems.map(item => (
            <div key={item._id} className="lostf-item-card">
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
                  {item.isClaimed ? (
                    <span className="lostf-status lostf-claimed">Claimed</span>
                  ) : (
                    <span className="lostf-status lostf-unclaimed">Unclaimed</span>
                  )}
                </div>
                
                {!item.isClaimed && (
                  <button
                    className="lostf-btn lostf-btn-primary"
                    onClick={() => handleOpenClaimModal(item._id)}
                  >
                    Claim Item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showClaimModal && (
        <div className="lostf-modal-overlay">
          <div className="lostf-modal-content">
            <div className="lostf-modal-header">
              <h3 className="lostf-admin-h3">Claim Item</h3>
              <button
                className="lostf-close-button"
                onClick={() => setShowClaimModal(false)}
              >
                ×
              </button>
            </div>
            <div className="lostf-claim-form">
              <form onSubmit={handleSubmitClaim}>
                <div className="lostf-form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={claimData.name}
                    onChange={handleClaimInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="lostf-form-group">
                  <label htmlFor="contact">Contact Information</label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={claimData.contact}
                    onChange={handleClaimInputChange}
                    required
                    placeholder="Phone number or email"
                  />
                </div>
                
                <div className="lostf-form-group">
                  <label htmlFor="details">Additional Details</label>
                  <textarea
                    id="details"
                    name="details"
                    value={claimData.details}
                    onChange={handleClaimInputChange}
                    rows="3"
                    placeholder="Please provide any details that can help verify your ownership..."
                  ></textarea>
                </div>
                
                <div className="lostf-form-actions">
                  <button
                    type="button"
                    className="lostf-btn lostf-btn-secondary"
                    onClick={() => setShowClaimModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="lostf-btn lostf-btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Lostfoundstudent