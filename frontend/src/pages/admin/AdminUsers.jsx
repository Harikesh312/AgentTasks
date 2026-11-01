import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSearch, FiFilter, FiAlertCircle, FiUsers, FiShield, FiUserCheck, FiSave, FiCheckCircle } from 'react-icons/fi';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const { memoryToken, user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    const anyOpen = !!(isModalOpen || deleteTarget);
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen, deleteTarget]);

  const fetchUsers = async () => {
    try {
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const res = await fetch(`${API_URL}/api/admin/users`, { headers, credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      active: users.filter(u => (u.completedQuestions?.length || 0) > 0).length,
    };
  }, [users]);

  const handleDelete = async (id) => {
    if (id === currentUser._id || id === currentUser.id) {
      alert("You cannot delete your own account.");
      setDeleteTarget(null);
      return;
    }

    try {
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(u => u._id !== id));
      setDeleteTarget(null);
      showToast('User deleted successfully.');
    } catch (err) {
      setDeleteTarget(null);
      showToast(err.message, 'error');
    }
  };

  const openModal = (user = null) => {
    setFormError('');
    setFormSuccess('');
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'user' });
    }
    setIsModalOpen(true);
  };

  const closeModal = (force = false) => {
    if (!force && !editingUser && (formData.name.trim() || formData.email.trim() || formData.password.trim())) {
      if (!window.confirm('Discard unsaved user details?')) return;
    }
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    // Client-side validation
    if (!formData.name.trim()) {
      setFormError('Name is required.');
      setFormLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required.');
      setFormLoading(false);
      return;
    }
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      setFormError('Password must be at least 6 characters.');
      setFormLoading(false);
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const url = editingUser
        ? `${API_URL}/api/admin/users/${editingUser._id}`
        : `${API_URL}/api/admin/users`;

      const method = editingUser ? 'PUT' : 'POST';

      const body = { ...formData };
      if (editingUser && !body.password) {
        delete body.password;
      }

      const res = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save user');

      await fetchUsers();
      setIsModalOpen(false);
      showToast(editingUser ? 'User updated successfully.' : 'User created successfully.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ap-loading">
        <div className="ap-spinner" />
        <span className="ap-loading-text">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ap-error-msg" style={{ margin: '20px' }}>
        <FiAlertCircle size={18} />
        Error: {error}
      </div>
    );
  }

  return (
    <div className="ap-users" style={{ animation: 'apFadeInUp 0.4s ease forwards' }}>
      <div className="ap-page-header ap-flex-header">
        <div>
          <h1>User Management</h1>
          <p>View, edit, or delete platform user accounts.</p>
        </div>
        <button className="ap-btn-primary" onClick={() => openModal()}>
          <FiPlus size={17} /> Add User
        </button>
      </div>

      {/* Summary Cards */}
      <div className="ap-u-stats">
        <div className="ap-metric ap-shade-blue">
          <div className="ap-metric-ico" style={{ background: '#E0EEFC', color: '#2563EB' }}>
            <FiUsers size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.total}</span>
            <span className="ap-metric-lbl">Total Users</span>
          </div>
        </div>
        <div className="ap-metric ap-shade-green">
          <div className="ap-metric-ico" style={{ background: '#E2F8ED', color: '#059669' }}>
            <FiUserCheck size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.active}</span>
            <span className="ap-metric-lbl">Active (w/ completions)</span>
          </div>
        </div>
        <div className="ap-metric ap-shade-purple">
          <div className="ap-metric-ico" style={{ background: '#EAE5FD', color: '#7C5CFC' }}>
            <FiShield size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.admins}</span>
            <span className="ap-metric-lbl">Administrators</span>
          </div>
        </div>
      </div>

      <div className="ap-card ap-shade-lavender">
        <div className="ap-card-header" style={{ padding: '16px 22px' }}>
          <div className="ap-users-toolbar">
            <div className="ap-search-wrap" style={{ flex: 1, maxWidth: '400px' }}>
              <FiSearch size={16} className="ap-search-ico" />
              <input
                type="text"
                className="ap-search"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ap-filter-wrap">
              <FiFilter size={15} className="ap-filter-ico" />
              <select
                className="ap-filter-sel"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="ap-table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          {filteredUsers.length > 0 ? (
            <table className="ap-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="ap-user-cell">
                        <div className="ap-user-cell-av">
                          {u.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="ap-user-cell-name">{u.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="ap-text-sec">{u.email}</span>
                    </td>
                    <td>
                      <span className={`ap-badge ${u.role === 'admin' ? 'ap-badge-admin' : 'ap-badge-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {(u.completedQuestions?.length || 0) > 0 ? (
                        <span className="ap-badge ap-badge-active">Active</span>
                      ) : (
                        <span className="ap-badge ap-badge-user">New</span>
                      )}
                    </td>
                    <td>
                      <div className="ap-action-btns">
                        <button
                          className="ap-btn-ghost"
                          onClick={() => openModal(u)}
                          title="Edit User"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          className="ap-btn-danger"
                          onClick={() => setDeleteTarget(u)}
                          title="Delete User"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="ap-empty-state">
              <div className="ap-empty-icon">
                <FiSearch size={24} />
              </div>
              <h3>No users found</h3>
              <p>
                {searchQuery || roleFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Add your first user to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal (Portalled to document.body for full viewport coverage) */}
      {isModalOpen && createPortal(
        <div
          className="ap-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !formLoading) closeModal();
          }}
        >
          <div className="ap-modal">
            <div className="ap-modal-header">
              <div>
                <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <p>{editingUser ? 'Update user account details.' : 'Create a new user account.'}</p>
              </div>
              <button
                type="button"
                className="ap-modal-close"
                onClick={() => !formLoading && closeModal()}
                title="Close"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="ap-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formError && <div className="ap-error-msg"><FiAlertCircle size={16} /> {formError}</div>}
                {formSuccess && <div className="ap-success-msg"><FiCheckCircle size={16} /> {formSuccess}</div>}

                <div className="ap-form-group">
                  <label className="ap-form-label">Full Name <span className="ap-required">*</span></label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-form-label">Email Address <span className="ap-required">*</span></label>
                  <input
                    type="email"
                    className="ap-form-input"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="user@example.com"
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-form-label">
                    Password {!editingUser && <span className="ap-required">*</span>} {editingUser && <span style={{ fontWeight: 400, color: 'var(--ap-text-muted)' }}>(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    className="ap-form-input"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? '••••••••' : 'Enter password (min 6 characters)'}
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-form-label">User Role</label>
                  <select
                    className="ap-form-select"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="ap-modal-footer">
                <button
                  type="button"
                  className="ap-btn-secondary"
                  onClick={() => !formLoading && closeModal()}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="ap-btn-primary" disabled={formLoading}>
                  <FiSave size={15} /> {formLoading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal (Portalled to document.body) */}
      {deleteTarget && createPortal(
        <div
          className="ap-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="ap-modal" style={{ maxWidth: '420px' }}>
            <div className="ap-modal-header">
              <div>
                <h2>Delete User</h2>
              </div>
              <button
                type="button"
                className="ap-modal-close"
                onClick={() => setDeleteTarget(null)}
                title="Close"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="ap-modal-body" style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
              <div className="ap-del-icon">
                <FiAlertCircle size={26} />
              </div>
              <p style={{ color: 'var(--ap-text-sec)', fontSize: '0.9rem', margin: '16px 0 6px', lineHeight: 1.5 }}>
                Are you sure you want to delete this user?
              </p>
              <p style={{ color: 'var(--ap-text)', fontSize: '0.92rem', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.5 }}>
                "{deleteTarget.name}" ({deleteTarget.email})
              </p>
              <p style={{ color: 'var(--ap-text-muted)', fontSize: '0.8rem', margin: '0', lineHeight: 1.5 }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="ap-modal-footer" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="ap-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ap-btn-primary"
                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}
                onClick={() => handleDelete(deleteTarget._id)}
              >
                <FiTrash2 size={15} /> Delete User
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* TOAST NOTIFICATION */}
      {toast && createPortal(
        <div className={`ap-toast ap-toast-${toast.type}`}>
          {toast.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
          {toast.message}
        </div>,
        document.body
      )}
    </div>
  );
}
