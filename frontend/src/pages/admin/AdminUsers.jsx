import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [formError, setFormError] = useState('');
  
  const { memoryToken, user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleDelete = async (id) => {
    if (id === currentUser._id) {
      alert("You cannot delete your own account.");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
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
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const openModal = (user = null) => {
    setFormError('');
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'user' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;
      
      const url = editingUser 
        ? `${API_URL}/api/admin/users/${editingUser._id}`
        : `${API_URL}/api/admin/users`;
        
      const method = editingUser ? 'PUT' : 'POST';
      
      const body = { ...formData };
      if (editingUser && !body.password) {
        delete body.password; // don't update password if empty
      }
      
      const res = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to save user');
      
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-users">
      <div className="admin-page-header flex-header">
        <div>
          <h1>User Management</h1>
          <p>View, edit, or delete user accounts.</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <FiPlus /> Add New User
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon edit" onClick={() => openModal(u)} title="Edit User">
                      <FiEdit2 />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(u._id)} title="Delete User">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              {formError && <div className="admin-error">{formError}</div>}
              
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Password {editingUser && '(leave blank to keep current)'}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required={!editingUser}
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
