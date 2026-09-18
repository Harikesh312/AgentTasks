import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { FiSave } from 'react-icons/fi';
import './AdminQuestions.css';

export default function AdminQuestions() {
  const { memoryToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    category: '',
    description: '',
    requirements: '',
    constraints: '',
    maxPromptTurns: 5,
    isOptimizationTrap: false,
    referenceImage: '/images/references/placeholder.svg'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      // Process array fields
      const processedData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
        constraints: formData.constraints.split('\n').filter(c => c.trim() !== '')
      };

      const res = await fetch(`${API_URL}/api/admin/questions`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(processedData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create question');
      }

      setSuccess('Question created successfully!');
      // Reset form
      setFormData({
        title: '',
        difficulty: 'Easy',
        category: '',
        description: '',
        requirements: '',
        constraints: '',
        maxPromptTurns: 5,
        isOptimizationTrap: false,
        referenceImage: '/images/references/placeholder.svg'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-questions">
      <div className="admin-page-header">
        <h1>Create New Question</h1>
        <p>Add a new practice problem to the database.</p>
      </div>

      <div className="admin-form-container">
        {success && <div className="admin-success-msg">{success}</div>}
        {error && <div className="admin-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-question-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group flex-1">
              <label>Category *</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Component" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Max Prompt Turns</label>
              <input type="number" name="maxPromptTurns" value={formData.maxPromptTurns} onChange={handleChange} min="1" required />
            </div>
            <div className="form-group flex-1">
              <label>Reference Image Path</label>
              <input type="text" name="referenceImage" value={formData.referenceImage} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input type="checkbox" id="isOptimizationTrap" name="isOptimizationTrap" checked={formData.isOptimizationTrap} onChange={handleChange} />
            <label htmlFor="isOptimizationTrap">Is Optimization Trap?</label>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required></textarea>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Requirements (one per line)</label>
              <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="6" placeholder="Full-width hero section...&#10;Primary CTA button..."></textarea>
            </div>
            <div className="form-group flex-1">
              <label>Constraints (one per line)</label>
              <textarea name="constraints" value={formData.constraints} onChange={handleChange} rows="6" placeholder="No external CSS frameworks...&#10;Use semantic HTML..."></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              <FiSave /> {loading ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
