import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { FiSave, FiCheckCircle, FiAlertCircle, FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './AdminQuestions.css';

export default function AdminQuestions() {
  const { memoryToken } = useAuth();
  
  // View state: 'list' or 'add'
  const [view, setView] = useState('list');
  
  // List state
  const [questions, setQuestions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Form state
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

  useEffect(() => {
    if (view === 'list') {
      fetchQuestions();
    }
  }, [view]);

  const fetchQuestions = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const res = await fetch(`${API_URL}/api/questions`, { headers, credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            q.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      return matchesSearch && matchesDiff;
    });
  }, [questions, searchQuery, difficultyFilter]);

  const stats = useMemo(() => {
    return {
      total: questions.length,
      easy: questions.filter(q => q.difficulty === 'Easy').length,
      medium: questions.filter(q => q.difficulty === 'Medium').length,
      hard: questions.filter(q => q.difficulty === 'Hard').length,
    };
  }, [questions]);

  const handleActionClick = (action) => {
    alert(`${action} functionality requires backend API implementation.`);
  };

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
      setFormData({
        title: '', difficulty: 'Easy', category: '', description: '',
        requirements: '', constraints: '', maxPromptTurns: 5,
        isOptimizationTrap: false, referenceImage: '/images/references/placeholder.svg'
      });
      
      // Auto return to list after short delay
      setTimeout(() => {
        setSuccess('');
        setView('list');
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'add') {
    return (
      <div className="ap-questions" style={{ animation: 'apFadeInUp 0.4s ease forwards' }}>
        <div className="ap-page-header ap-flex-header">
          <div>
            <h1>Create New Question</h1>
            <p>Add a new practice problem to the database.</p>
          </div>
          <button className="ap-btn-secondary" onClick={() => setView('list')}>
            <FiArrowLeft size={16} /> Back to Questions
          </button>
        </div>

        <div className="ap-card ap-questions-form-card ap-shade-lavender">
          <div className="ap-card-body" style={{ padding: '28px' }}>
            {success && <div className="ap-success-msg"><FiCheckCircle size={17} />{success}</div>}
            {error && <div className="ap-error-msg"><FiAlertCircle size={17} />{error}</div>}

            <form onSubmit={handleSubmit} className="ap-q-form">
              <div className="ap-q-row">
                <div className="ap-form-group" style={{ flex: 2 }}>
                  <label className="ap-form-label">Title <span className="ap-required">*</span></label>
                  <input type="text" name="title" className="ap-form-input" value={formData.title} onChange={handleChange} required placeholder="e.g. Build a Hero Section" />
                </div>
                <div className="ap-form-group" style={{ flex: 1 }}>
                  <label className="ap-form-label">Category <span className="ap-required">*</span></label>
                  <input type="text" name="category" className="ap-form-input" value={formData.category} onChange={handleChange} placeholder="e.g. Component" required />
                </div>
              </div>

              <div className="ap-q-row">
                <div className="ap-form-group" style={{ flex: 1 }}>
                  <label className="ap-form-label">Difficulty</label>
                  <select name="difficulty" className="ap-form-select" value={formData.difficulty} onChange={handleChange}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="ap-form-group" style={{ flex: 1 }}>
                  <label className="ap-form-label">Max Prompt Turns</label>
                  <input type="number" name="maxPromptTurns" className="ap-form-input" value={formData.maxPromptTurns} onChange={handleChange} min="1" required />
                </div>
                <div className="ap-form-group" style={{ flex: 1 }}>
                  <label className="ap-form-label">Reference Image Path</label>
                  <input type="text" name="referenceImage" className="ap-form-input" value={formData.referenceImage} onChange={handleChange} placeholder="/images/references/..." />
                </div>
              </div>

              <div className="ap-q-checkbox">
                <input type="checkbox" id="isOptimizationTrap" name="isOptimizationTrap" checked={formData.isOptimizationTrap} onChange={handleChange} className="ap-checkbox" />
                <label htmlFor="isOptimizationTrap" className="ap-checkbox-label">Is Optimization Trap?</label>
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">Description <span className="ap-required">*</span></label>
                <textarea name="description" className="ap-form-textarea" value={formData.description} onChange={handleChange} rows="4" required placeholder="Describe the question in detail..." />
              </div>

              <div className="ap-q-row">
                <div className="ap-form-group" style={{ flex: 1 }}>
                  <label className="ap-form-label">Requirements <span style={{ fontWeight: 400, color: 'var(--ap-text-muted)' }}>(one per line)</span></label>
                  <textarea name="requirements" className="ap-form-textarea" value={formData.requirements} onChange={handleChange} rows="6" placeholder={"Full-width hero section...\nPrimary CTA button..."} />
                </div>
                <div className="ap-form-group" style={{ flex: 1 }}>
                  <label className="ap-form-label">Constraints <span style={{ fontWeight: 400, color: 'var(--ap-text-muted)' }}>(one per line)</span></label>
                  <textarea name="constraints" className="ap-form-textarea" value={formData.constraints} onChange={handleChange} rows="6" placeholder={"No external CSS frameworks...\nUse semantic HTML..."} />
                </div>
              </div>

              <div className="ap-q-actions">
                <button type="submit" className="ap-btn-primary" disabled={loading}>
                  <FiSave size={16} /> {loading ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="ap-questions" style={{ animation: 'apFadeInUp 0.4s ease forwards' }}>
      <div className="ap-page-header ap-flex-header">
        <div>
          <h1>Questions</h1>
          <p>Manage and organize interview questions.</p>
        </div>
        <button className="ap-btn-primary" onClick={() => setView('add')}>
          <FiPlus size={17} /> Add Question
        </button>
      </div>

      {/* Stats Summary */}
      <div className="ap-q-stats">
        <div className="ap-q-stat-card ap-shade-lavender">
          <div className="ap-q-stat-val">{stats.total}</div>
          <div className="ap-q-stat-lbl">Total Questions</div>
        </div>
        <div className="ap-q-stat-card ap-shade-green">
          <div className="ap-q-stat-val" style={{ color: '#059669' }}>{stats.easy}</div>
          <div className="ap-q-stat-lbl">Easy</div>
        </div>
        <div className="ap-q-stat-card ap-shade-orange">
          <div className="ap-q-stat-val" style={{ color: '#D97706' }}>{stats.medium}</div>
          <div className="ap-q-stat-lbl">Medium</div>
        </div>
        <div className="ap-q-stat-card ap-shade-red">
          <div className="ap-q-stat-val" style={{ color: 'var(--ap-danger)' }}>{stats.hard}</div>
          <div className="ap-q-stat-lbl">Hard</div>
        </div>
      </div>

      <div className="ap-card ap-shade-lavender">
        <div className="ap-card-header" style={{ padding: '16px 22px' }}>
          <div className="ap-q-toolbar">
            <div className="ap-search-wrap" style={{ flex: 1, maxWidth: '400px' }}>
              <FiSearch size={16} className="ap-search-ico" />
              <input
                type="text"
                className="ap-search"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ap-filter-wrap">
              <FiFilter size={15} className="ap-filter-ico" />
              <select className="ap-filter-sel" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="ap-table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          {loadingList ? (
            <div className="ap-loading" style={{ padding: '40px 0' }}>
              <div className="ap-spinner" />
              <span className="ap-loading-text">Loading questions...</span>
            </div>
          ) : listError ? (
            <div className="ap-error-msg" style={{ margin: '20px' }}><FiAlertCircle size={18} /> {listError}</div>
          ) : filteredQuestions.length > 0 ? (
            <table className="ap-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map(q => (
                  <tr key={q.id}>
                    <td style={{ color: 'var(--ap-text-muted)', fontWeight: 600 }}>#{q.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ap-text)' }}>{q.title}</div>
                    </td>
                    <td>{q.category}</td>
                    <td>
                      <span className={`ap-badge ap-badge-${q.difficulty.toLowerCase()}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="ap-action-btns">
                        <Link to={`/questions/${q.id}`} className="ap-btn-ghost" title="View in App">
                          <FiEye size={15} />
                        </Link>
                        <button className="ap-btn-ghost" onClick={() => handleActionClick('Edit')} title="Edit">
                          <FiEdit2 size={15} />
                        </button>
                        <button className="ap-btn-danger" onClick={() => handleActionClick('Delete')} title="Delete">
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
              <div className="ap-empty-icon"><FiSearch size={24} /></div>
              <h3>No questions found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
