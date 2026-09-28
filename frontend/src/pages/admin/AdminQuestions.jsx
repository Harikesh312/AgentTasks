import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { FiSave, FiCheckCircle, FiAlertCircle, FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiArrowLeft, FiX } from 'react-icons/fi';
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

  // Form state (for Add Question)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', difficulty: 'Easy', category: '', description: '',
    requirements: '', constraints: '', maxPromptTurns: 5,
    isOptimizationTrap: false, referenceImage: '/images/references/placeholder.svg'
  });

  // View modal state
  const [viewQuestion, setViewQuestion] = useState(null);

  // Edit modal state
  const [editQuestion, setEditQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Auth headers helpers
  const getHeaders = useCallback(() => {
    const h = {};
    if (memoryToken) h['Authorization'] = `Bearer ${memoryToken}`;
    return h;
  }, [memoryToken]);

  const getJsonHeaders = useCallback(() => {
    const h = { 'Content-Type': 'application/json' };
    if (memoryToken) h['Authorization'] = `Bearer ${memoryToken}`;
    return h;
  }, [memoryToken]);

  // Fetch questions on list view
  useEffect(() => {
    if (view === 'list') fetchQuestions();
  }, [view]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const anyOpen = !!(viewQuestion || editQuestion || deleteTarget);
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [viewQuestion, editQuestion, deleteTarget]);

  const fetchQuestions = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const res = await fetch(`${API_URL}/api/questions`, { headers: getHeaders(), credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch questions');
      setQuestions(await res.json());
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

  const stats = useMemo(() => ({
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'Easy').length,
    medium: questions.filter(q => q.difficulty === 'Medium').length,
    hard: questions.filter(q => q.difficulty === 'Hard').length,
  }), [questions]);

  // ──── ADD QUESTION HANDLERS ────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const processedData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
        constraints: formData.constraints.split('\n').filter(c => c.trim() !== '')
      };
      const res = await fetch(`${API_URL}/api/admin/questions`, {
        method: 'POST', headers: getJsonHeaders(), credentials: 'include',
        body: JSON.stringify(processedData)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to create question'); }
      setSuccess('Question created successfully!');
      setFormData({ title: '', difficulty: 'Easy', category: '', description: '',
        requirements: '', constraints: '', maxPromptTurns: 5,
        isOptimizationTrap: false, referenceImage: '/images/references/placeholder.svg' });
      setTimeout(() => { setSuccess(''); setView('list'); }, 1500);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ──── VIEW HANDLER ────

  const handleView = (q) => setViewQuestion(q);

  // ──── EDIT HANDLERS ────

  const handleEditOpen = (q) => {
    setEditError('');
    setEditQuestion(q);
    setEditFormData({
      title: q.title || '', difficulty: q.difficulty || 'Easy', category: q.category || '',
      description: q.description || '',
      requirements: Array.isArray(q.requirements) ? q.requirements.join('\n') : '',
      constraints: Array.isArray(q.constraints) ? q.constraints.join('\n') : '',
      maxPromptTurns: q.maxPromptTurns || 5, isOptimizationTrap: q.isOptimizationTrap || false,
      referenceImage: q.referenceImage || '/images/references/placeholder.svg'
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({ ...editFormData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true); setEditError('');
    try {
      if (!editFormData.title?.trim()) throw new Error('Title is required');
      if (!editFormData.category?.trim()) throw new Error('Category is required');
      if (!editFormData.description?.trim()) throw new Error('Description is required');

      const processedData = {
        ...editFormData,
        requirements: editFormData.requirements.split('\n').filter(r => r.trim() !== ''),
        constraints: editFormData.constraints.split('\n').filter(c => c.trim() !== ''),
        maxPromptTurns: parseInt(editFormData.maxPromptTurns, 10) || 5
      };
      const res = await fetch(`${API_URL}/api/admin/questions/${editQuestion.id}`, {
        method: 'PUT', headers: getJsonHeaders(), credentials: 'include',
        body: JSON.stringify(processedData)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to update question'); }
      const updated = await res.json();
      setQuestions(prev => prev.map(q => q.id === editQuestion.id ? updated : q));
      setEditQuestion(null);
      showToast('Question updated successfully.');
    } catch (err) { setEditError(err.message || 'Unable to update question. Please try again.'); }
    finally { setEditLoading(false); }
  };

  // ──── DELETE HANDLERS ────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true); setDeleteError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/questions/${deleteTarget.id}`, {
        method: 'DELETE', headers: getHeaders(), credentials: 'include'
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to delete question'); }
      setQuestions(prev => prev.filter(q => q.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Question deleted successfully.');
    } catch (err) { setDeleteError(err.message || 'Unable to delete question. Please try again.'); }
    finally { setDeleteLoading(false); }
  };

  // ════════════════════════════════════════
  //  ADD QUESTION VIEW (unchanged)
  // ════════════════════════════════════════

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
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
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

  // ════════════════════════════════════════
  //  LIST VIEW
  // ════════════════════════════════════════

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
              <input type="text" className="ap-search" placeholder="Search questions..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="ap-filter-wrap">
              <FiFilter size={15} className="ap-filter-ico" />
              <select className="ap-filter-sel" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="ap-table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          {loadingList ? (
            <div className="ap-loading" style={{ padding: '40px 0' }}>
              <div className="ap-spinner" /><span className="ap-loading-text">Loading questions...</span>
            </div>
          ) : listError ? (
            <div className="ap-error-msg" style={{ margin: '20px' }}><FiAlertCircle size={18} /> {listError}</div>
          ) : filteredQuestions.length > 0 ? (
            <table className="ap-table">
              <thead>
                <tr>
                  <th>ID</th><th>Question</th><th>Category</th><th>Difficulty</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map(q => (
                  <tr key={q.id}>
                    <td style={{ color: 'var(--ap-text-muted)', fontWeight: 600 }}>#{q.id}</td>
                    <td><div style={{ fontWeight: 600, color: 'var(--ap-text)' }}>{q.title}</div></td>
                    <td>{q.category}</td>
                    <td>
                      <span className={`ap-badge ap-badge-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                    </td>
                    <td>
                      <div className="ap-action-btns">
                        <button className="ap-btn-ghost" onClick={() => handleView(q)} title="View Question">
                          <FiEye size={15} />
                        </button>
                        <button className="ap-btn-ghost" onClick={() => handleEditOpen(q)} title="Edit">
                          <FiEdit2 size={15} />
                        </button>
                        <button className="ap-btn-danger" onClick={() => { setDeleteError(''); setDeleteTarget(q); }} title="Delete">
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
              <h3>No questions found</h3><p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ PORTALLED MODALS — rendered on document.body ══════════ */}

      {/* VIEW QUESTION MODAL */}
      {viewQuestion && createPortal(
        <div className="apq-overlay" onClick={(e) => e.target === e.currentTarget && setViewQuestion(null)}>
          <div className="apq-modal apq-modal-view">
            <div className="apq-modal-header">
              <div>
                <h2>View Question</h2>
                <p>Complete question details</p>
              </div>
              <button className="ap-modal-close" onClick={() => setViewQuestion(null)}><FiX size={20} /></button>
            </div>
            <div className="apq-modal-body">
              <div className="ap-view-field">
                <span className="ap-view-label">ID</span>
                <span className="ap-view-value">#{viewQuestion.id}</span>
              </div>
              <div className="ap-view-field">
                <span className="ap-view-label">Question</span>
                <span className="ap-view-value" style={{ fontWeight: 600 }}>{viewQuestion.title}</span>
              </div>
              <div className="ap-view-row">
                <div className="ap-view-field" style={{ flex: 1 }}>
                  <span className="ap-view-label">Category</span>
                  <span className="ap-view-value">{viewQuestion.category}</span>
                </div>
                <div className="ap-view-field" style={{ flex: 1 }}>
                  <span className="ap-view-label">Difficulty</span>
                  <span className="ap-view-value">
                    <span className={`ap-badge ap-badge-${viewQuestion.difficulty.toLowerCase()}`}>{viewQuestion.difficulty}</span>
                  </span>
                </div>
              </div>
              <div className="ap-view-field">
                <span className="ap-view-label">Description</span>
                <span className="ap-view-value ap-view-desc">{viewQuestion.description}</span>
              </div>
              {viewQuestion.requirements?.length > 0 && (
                <div className="ap-view-field">
                  <span className="ap-view-label">Requirements</span>
                  <ul className="ap-view-list">{viewQuestion.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              {viewQuestion.constraints?.length > 0 && (
                <div className="ap-view-field">
                  <span className="ap-view-label">Constraints</span>
                  <ul className="ap-view-list">{viewQuestion.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>
              )}
              <div className="ap-view-row">
                <div className="ap-view-field" style={{ flex: 1 }}>
                  <span className="ap-view-label">Max Prompt Turns</span>
                  <span className="ap-view-value">{viewQuestion.maxPromptTurns}</span>
                </div>
                <div className="ap-view-field" style={{ flex: 1 }}>
                  <span className="ap-view-label">Optimization Trap</span>
                  <span className="ap-view-value">{viewQuestion.isOptimizationTrap ? 'Yes' : 'No'}</span>
                </div>
              </div>
              {viewQuestion.referenceImage && (
                <div className="ap-view-field">
                  <span className="ap-view-label">Reference Image</span>
                  <span className="ap-view-value" style={{ fontSize: '0.82rem', wordBreak: 'break-all' }}>{viewQuestion.referenceImage}</span>
                </div>
              )}
            </div>
            <div className="apq-modal-footer">
              <button className="ap-btn-secondary" onClick={() => setViewQuestion(null)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT QUESTION MODAL */}
      {editQuestion && createPortal(
        <div className="apq-overlay" onClick={(e) => e.target === e.currentTarget && !editLoading && setEditQuestion(null)}>
          <div className="apq-modal apq-modal-edit">
            <div className="apq-modal-header">
              <div>
                <h2>Edit Question</h2>
                <p>Update question #{editQuestion.id}</p>
              </div>
              <button className="ap-modal-close" onClick={() => !editLoading && setEditQuestion(null)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="apq-edit-form">
              <div className="apq-modal-body">
                {editError && <div className="ap-error-msg"><FiAlertCircle size={16} /> {editError}</div>}

                <div className="ap-form-group">
                  <label className="ap-form-label">Title <span className="ap-required">*</span></label>
                  <input type="text" name="title" className="ap-form-input" value={editFormData.title} onChange={handleEditChange} required placeholder="Question title" />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="ap-form-group" style={{ flex: 1 }}>
                    <label className="ap-form-label">Category <span className="ap-required">*</span></label>
                    <input type="text" name="category" className="ap-form-input" value={editFormData.category} onChange={handleEditChange} required placeholder="e.g. Component" />
                  </div>
                  <div className="ap-form-group" style={{ flex: 1 }}>
                    <label className="ap-form-label">Difficulty</label>
                    <select name="difficulty" className="ap-form-select" value={editFormData.difficulty} onChange={handleEditChange}>
                      <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="ap-form-group">
                  <label className="ap-form-label">Description <span className="ap-required">*</span></label>
                  <textarea name="description" className="ap-form-textarea" value={editFormData.description} onChange={handleEditChange} rows="3" required placeholder="Describe the question in detail..." />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="ap-form-group" style={{ flex: 1 }}>
                    <label className="ap-form-label">Requirements <span style={{ fontWeight: 400, color: 'var(--ap-text-muted)' }}>(one per line)</span></label>
                    <textarea name="requirements" className="ap-form-textarea" value={editFormData.requirements} onChange={handleEditChange} rows="4" placeholder={"Full-width hero section...\nPrimary CTA button..."} />
                  </div>
                  <div className="ap-form-group" style={{ flex: 1 }}>
                    <label className="ap-form-label">Constraints <span style={{ fontWeight: 400, color: 'var(--ap-text-muted)' }}>(one per line)</span></label>
                    <textarea name="constraints" className="ap-form-textarea" value={editFormData.constraints} onChange={handleEditChange} rows="4" placeholder={"No external CSS frameworks...\nUse semantic HTML..."} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div className="ap-form-group" style={{ flex: 1 }}>
                    <label className="ap-form-label">Max Prompt Turns</label>
                    <input type="number" name="maxPromptTurns" className="ap-form-input" value={editFormData.maxPromptTurns} onChange={handleEditChange} min="1" />
                  </div>
                  <div className="ap-form-group" style={{ flex: 1 }}>
                    <label className="ap-form-label">Reference Image Path</label>
                    <input type="text" name="referenceImage" className="ap-form-input" value={editFormData.referenceImage} onChange={handleEditChange} placeholder="/images/references/..." />
                  </div>
                </div>

                <div className="ap-q-checkbox">
                  <input type="checkbox" id="editIsOptimizationTrap" name="isOptimizationTrap" checked={editFormData.isOptimizationTrap} onChange={handleEditChange} className="ap-checkbox" />
                  <label htmlFor="editIsOptimizationTrap" className="ap-checkbox-label">Is Optimization Trap?</label>
                </div>
              </div>

              <div className="apq-modal-footer">
                <button type="button" className="ap-btn-secondary" onClick={() => !editLoading && setEditQuestion(null)} disabled={editLoading}>Cancel</button>
                <button type="submit" className="ap-btn-primary" disabled={editLoading}>
                  <FiSave size={15} /> {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && createPortal(
        <div className="apq-overlay" onClick={(e) => e.target === e.currentTarget && !deleteLoading && setDeleteTarget(null)}>
          <div className="apq-modal apq-modal-delete">
            <div className="apq-modal-header">
              <div><h2>Delete Question</h2></div>
              <button className="ap-modal-close" onClick={() => !deleteLoading && setDeleteTarget(null)}><FiX size={20} /></button>
            </div>
            <div className="apq-modal-body" style={{ textAlign: 'center' }}>
              <div className="ap-del-icon"><FiAlertCircle size={26} /></div>
              <p style={{ color: 'var(--ap-text-sec)', fontSize: '0.9rem', margin: '16px 0 6px', lineHeight: 1.5 }}>
                Are you sure you want to delete this question?
              </p>
              <p style={{ color: 'var(--ap-text)', fontSize: '0.88rem', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.5 }}>
                "{deleteTarget.title}"
              </p>
              <p style={{ color: 'var(--ap-text-muted)', fontSize: '0.8rem', margin: '0', lineHeight: 1.5 }}>
                This action cannot be undone.
              </p>
              {deleteError && (
                <div className="ap-error-msg" style={{ textAlign: 'left', marginTop: '16px' }}>
                  <FiAlertCircle size={16} /> {deleteError}
                </div>
              )}
            </div>
            <div className="apq-modal-footer" style={{ justifyContent: 'center' }}>
              <button className="ap-btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
              <button className="ap-btn-primary" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}
                onClick={handleDeleteConfirm} disabled={deleteLoading}>
                <FiTrash2 size={15} /> {deleteLoading ? 'Deleting...' : 'Delete Question'}
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
