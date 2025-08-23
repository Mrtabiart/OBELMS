import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, RefreshCw, Search } from "lucide-react";
import "./Trash.css";

function Trash() {
  const [deletedItems, setDeletedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/trash"); 
        setDeletedItems(res.data);
      } catch (err) {
        console.error("Error fetching trash data:", err);
      }
    };

    fetchTrash();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRecover = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/trash/restore/${id}`);
      setDeletedItems(prev => prev.filter(item => item._id !== id));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      alert("Item recovered successfully!");
    } catch (err) {
      console.error("Recovery failed:", err);
    }
  };

  const handleRecoverSelected = async () => {
    if (selectedItems.size === 0) {
      alert("Please select items to recover");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/trash/recover-multiple", {
        ids: Array.from(selectedItems),
      });
      setDeletedItems(prev => prev.filter(item => !selectedItems.has(item._id)));
      setSelectedItems(new Set());
      alert(`${selectedItems.size} item(s) recovered successfully!`);
    } catch (err) {
      console.error("Bulk recovery failed:", err);
    }
  };

  const handleSelect = (id) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const filteredItems = deletedItems.filter(item => {
    const searchFields = [
      item.data?.name,
      item.data?.email,
      item.data?.title,
      item.originalCollection
    ].filter(Boolean).map(f => f.toString().toLowerCase());

    return searchFields.some(field => field.includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="tsh-trash-container">
      <div className="tsh-trash-header">
        <Trash2 className="tsh-trash-icon" size={24} />
        <h1>Trash</h1>
        <div className="tsh-count-badge">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="tsh-trash-actions">
        <div className="tsh-search-container">
          <Search size={20} className="tsh-search-icon" />
          <input
            type="text"
            placeholder="Search in trash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tsh-search-input"
            aria-label="Search trash items"
          />
        </div>
        
        {selectedItems.size > 0 && (
          <button
            className="tsh-recover-selected-button"
            onClick={handleRecoverSelected}
          >
            <RefreshCw size={18} />
            <span>Recover Selected ({selectedItems.size})</span>
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="tsh-empty-trash">
          <Trash2 size={48} className="tsh-empty-trash-icon" />
          <p>No items found</p>
          <span>
            {searchQuery 
              ? "No matching items found. Try different search terms." 
              : "Your trash is empty. Deleted items will appear here."}
          </span>
        </div>
      ) : (
        <div className="tsh-trash-items">
          {filteredItems.map((item) => (
            <div key={item._id} className="tsh-trash-item">
              <div className="tsh-item-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item._id)}
                  onChange={() => handleSelect(item._id)}
                  aria-label={`Select ${item.data?.name || item.originalCollection}`}
                />
              </div>
              
              <div className="tsh-item-details">
                <h3>{item.data?.name || item.originalCollection}</h3>
                <p className="tsh-item-content">
                  {item.data?.email || item.data?.title || "No additional data"}
                </p>
                <div className="tsh-item-meta">
                  <p className="tsh-delete-date">
                    <span>Deleted on:</span> {formatDate(item.deletedAt)}
                  </p>
                  <p className="tsh-original-collection">
                    <span>From:</span> {item.originalCollection}
                  </p>
                </div>
              </div>
              
              <button
                className="tsh-recover-button"
                onClick={() => handleRecover(item._id)}
                aria-label={`Recover ${item.data?.name || 'item'}`}
              >
                <RefreshCw size={18} />
                <span>Recover</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Trash;