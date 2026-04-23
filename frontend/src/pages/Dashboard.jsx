import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';

// ── Empty item form template ──────────────────────────────
const emptyForm = {
  itemName: '',
  description: '',
  type: 'Lost',
  location: '',
  date: '',
  contactInfo: '',
};

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [formData, setFormData]   = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem]       = useState(null); // item being edited in modal

  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = not searched
  const [searching, setSearching]       = useState(false);

  // ── Fetch all items ───────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/items');
      setItems(res.data);
    } catch (err) {
      console.error('Fetch items error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Handle add-form field changes ─────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Handle edit-modal field changes ───────────────────
  const handleEditChange = (e) => {
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  // ── Submit new item ───────────────────────────────────
  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = { ...formData };
      if (!payload.date) delete payload.date;
      await API.post('/api/items', payload);
      setFormData(emptyForm);
      setShowAddForm(false);
      setFormSuccess('Item reported successfully!');
      setTimeout(() => setFormSuccess(''), 3000);
      await fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit edit ───────────────────────────────────────
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await API.put(`/api/items/${editItem._id}`, {
        itemName:    editItem.itemName,
        description: editItem.description,
        type:        editItem.type,
        location:    editItem.location,
        date:        editItem.date,
        contactInfo: editItem.contactInfo,
      });
      setEditItem(null);
      setFormSuccess('Item updated successfully!');
      setTimeout(() => setFormSuccess(''), 3000);
      await fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update item.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete item ───────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/api/items/${id}`);
      setFormSuccess('Item deleted.');
      setTimeout(() => setFormSuccess(''), 3000);
      await fetchItems();
      if (searchResults) {
        setSearchResults(searchResults.filter((i) => i._id !== id));
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  // ── Search items ──────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await API.get(`/api/items/search?name=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // ── Derived stats ─────────────────────────────────────
  const displayedItems = searchResults !== null ? searchResults : items;
  const totalLost  = items.filter((i) => i.type === 'Lost').length;
  const totalFound = items.filter((i) => i.type === 'Found').length;

  const isOwner = (item) =>
    item.postedBy && (item.postedBy._id === user?._id || item.postedBy === user?._id);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  // ── Open edit modal ───────────────────────────────────
  const openEdit = (item) => {
    setEditItem({
      ...item,
      date: item.date ? item.date.substring(0, 10) : '',
    });
    setFormError('');
  };

  return (
    <>
      <div className="dashboard-container">
        {/* ── Header ── */}
        <div className="dashboard-header">
          <h1>
            <i className="bi bi-search-heart me-2" style={{ color: 'var(--primary)' }}></i>
            Campus Lost &amp; Found
          </h1>
          <p>Report lost items or help others find what they've lost</p>
        </div>

        {/* ── Stats ── */}
        <div className="stats-row">
          <div className="stat-badge total">
            <div className="stat-number">{items.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-badge lost">
            <div className="stat-number">{totalLost}</div>
            <div className="stat-label">Lost Items</div>
          </div>
          <div className="stat-badge found">
            <div className="stat-number">{totalFound}</div>
            <div className="stat-label">Found Items</div>
          </div>
        </div>

        {/* ── Global alerts ── */}
        {formSuccess && (
          <div className="alert alert-success alert-custom mb-3" id="dashboard-success">
            <i className="bi bi-check-circle-fill me-2"></i>{formSuccess}
          </div>
        )}
        {formError && !editItem && (
          <div className="alert alert-danger alert-custom mb-3" id="dashboard-error">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{formError}
          </div>
        )}

        {/* ── Toggle add form ── */}
        <button
          className="btn-add-toggle"
          onClick={() => { setShowAddForm(!showAddForm); setFormError(''); }}
          id="toggle-add-form"
        >
          <i className={`bi ${showAddForm ? 'bi-x-circle' : 'bi-plus-circle'}`}></i>
          {showAddForm ? 'Cancel' : 'Report an Item'}
        </button>

        {/* ── Add Item Form ── */}
        {showAddForm && (
          <div className="form-card" id="add-item-form">
            <h4><i className="bi bi-plus-circle-fill"></i> Report a Lost or Found Item</h4>
            {formError && (
              <div className="alert alert-danger alert-custom mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{formError}
              </div>
            )}
            <form onSubmit={handleAddItem}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Item Name *</label>
                  <input
                    type="text" name="itemName" className="form-control"
                    placeholder="e.g. Blue water bottle"
                    value={formData.itemName} onChange={handleChange} required
                    id="add-itemName"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Type *</label>
                  <select name="type" className="form-select" value={formData.type} onChange={handleChange} required id="add-type">
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date" name="date" className="form-control"
                    value={formData.date} onChange={handleChange} id="add-date"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location *</label>
                  <input
                    type="text" name="location" className="form-control"
                    placeholder="e.g. Library Block A"
                    value={formData.location} onChange={handleChange} required id="add-location"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contact Info *</label>
                  <input
                    type="text" name="contactInfo" className="form-control"
                    placeholder="Phone number or email"
                    value={formData.contactInfo} onChange={handleChange} required id="add-contactInfo"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description" className="form-control" rows="2"
                    placeholder="Additional details about the item..."
                    value={formData.description} onChange={handleChange} id="add-description"
                  />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-submit" disabled={submitting} id="add-submit">
                    {submitting ? (
                      <><span className="spinner-border spinner-border-sm me-1"></span> Submitting...</>
                    ) : (
                      <><i className="bi bi-send me-1"></i> Submit Report</>
                    )}
                  </button>
                  <button type="button" className="btn btn-cancel" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Search Bar ── */}
        <form onSubmit={handleSearch} className="d-flex gap-2 mb-3" id="search-form">
          <div className="search-bar flex-grow-1">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text" className="form-control" id="search-input"
              placeholder="Search items by name, type, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-submit" disabled={searching} id="search-submit"
            style={{ borderRadius: '50px', padding: '.6rem 1.25rem', whiteSpace: 'nowrap' }}>
            {searching ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-search me-1"></i>Search</>}
          </button>
          {searchResults !== null && (
            <button type="button" className="btn btn-cancel" onClick={clearSearch}
              style={{ borderRadius: '50px', padding: '.6rem 1.25rem', whiteSpace: 'nowrap' }}>
              <i className="bi bi-x me-1"></i>Clear
            </button>
          )}
        </form>

        {searchResults !== null && (
          <div className="mb-3">
            <span className="badge" style={{ background: 'var(--primary)', fontSize: '.8rem', padding: '.4rem .8rem', borderRadius: '50px' }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </span>
          </div>
        )}

        {/* ── Items Grid ── */}
        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner-border" style={{ color: 'var(--primary)' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h5>{searchResults !== null ? 'No results found' : 'No items reported yet'}</h5>
            <p>{searchResults !== null ? 'Try a different search term.' : 'Be the first to report a lost or found item!'}</p>
          </div>
        ) : (
          <div className="items-grid" id="items-grid">
            {displayedItems.map((item) => (
              <div key={item._id} className={`item-card ${item.type.toLowerCase()}`} id={`item-${item._id}`}>
                <div className="item-header">
                  <h5 className="item-name">{item.itemName}</h5>
                  <span className={`item-type-badge ${item.type.toLowerCase()}`}>
                    <i className={`bi ${item.type === 'Lost' ? 'bi-exclamation-circle' : 'bi-check-circle'} me-1`}></i>
                    {item.type}
                  </span>
                </div>

                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}

                <div className="item-detail">
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>{item.location}</span>
                </div>
                <div className="item-detail">
                  <i className="bi bi-calendar3"></i>
                  <span>{formatDate(item.date)}</span>
                </div>
                <div className="item-detail">
                  <i className="bi bi-telephone-fill"></i>
                  <span>{item.contactInfo}</span>
                </div>

                <div className="item-footer">
                  <span className="posted-by">
                    <i className="bi bi-person-circle me-1"></i>
                    {item.postedBy?.name || 'Unknown'}
                  </span>
                  {isOwner(item) && (
                    <div className="item-actions">
                      <button
                        className="btn-icon edit" title="Edit item"
                        onClick={() => openEdit(item)}
                        id={`edit-${item._id}`}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className="btn-icon delete" title="Delete item"
                        onClick={() => handleDelete(item._id)}
                        id={`delete-${item._id}`}
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editItem && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditItem(null)} id="edit-modal">
          <div className="modal-content-custom">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-700 mb-0" style={{ fontWeight: 700, color: 'var(--darker)' }}>
                <i className="bi bi-pencil-square me-2" style={{ color: 'var(--primary)' }}></i>
                Edit Item
              </h5>
              <button className="btn-icon delete" onClick={() => setEditItem(null)} title="Close" id="close-edit-modal">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {formError && (
              <div className="alert alert-danger alert-custom mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{formError}
              </div>
            )}

            <form onSubmit={handleUpdateItem} id="edit-form">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Item Name *</label>
                  <input
                    type="text" name="itemName" className="form-control"
                    value={editItem.itemName} onChange={handleEditChange} required id="edit-itemName"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Type *</label>
                  <select name="type" className="form-select" value={editItem.type} onChange={handleEditChange} required id="edit-type">
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Date</label>
                  <input type="date" name="date" className="form-control" value={editItem.date} onChange={handleEditChange} id="edit-date" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Location *</label>
                  <input type="text" name="location" className="form-control" value={editItem.location} onChange={handleEditChange} required id="edit-location" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Contact Info *</label>
                  <input type="text" name="contactInfo" className="form-control" value={editItem.contactInfo} onChange={handleEditChange} required id="edit-contactInfo" />
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Description</label>
                  <textarea name="description" className="form-control" rows="2" value={editItem.description || ''} onChange={handleEditChange} id="edit-description" />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-submit" disabled={submitting} id="edit-submit">
                    {submitting ? <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</> : <><i className="bi bi-check2 me-1"></i> Save Changes</>}
                  </button>
                  <button type="button" className="btn btn-cancel" onClick={() => setEditItem(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
