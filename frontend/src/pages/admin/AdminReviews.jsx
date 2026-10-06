import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import {
  FiChevronDown, FiSearch, FiEdit2, FiTrash2, FiX,
  FiAlertCircle, FiCheckCircle, FiSave, FiArrowRight
} from 'react-icons/fi';
import './AdminReviews.css';

export default function AdminReviews() {
  const { memoryToken } = useAuth();

  // Data state
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Loading / error
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  const [reviewsError, setReviewsError] = useState('');

  // Modals
  const [qModalOpen, setQModalOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [editBody, setEditBody] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const getHeaders = useCallback(() => {
    const h = { 'Content-Type': 'application/json' };
    if (memoryToken) h['Authorization'] = `Bearer ${memoryToken}`;
    return h;
  }, [memoryToken]);

  // Lock body scroll when modal is open
  useEffect(() => {
    const anyOpen = qModalOpen || editReview || deleteTarget;
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [qModalOpen, editReview, deleteTarget]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    setQuestionsError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/questions`, {
        headers: getHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setQuestionsError(err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Fetch reviews when question changes
  useEffect(() => {
    if (selectedQuestionId) {
      fetchReviews(selectedQuestionId);
    } else {
      setReviews([]);
      setSelectedQuestion(null);
    }
  }, [selectedQuestionId]);

  const fetchReviews = async (qId) => {
    setLoadingReviews(true);
    setReviewsError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews?questionId=${qId}`, {
        headers: getHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setSelectedQuestion(data.question);
      setReviews(data.reviews || []);
    } catch (err) {
      setReviewsError(err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  // ─── Edit ───
  const openEditModal = (review) => {
    setEditReview(review);
    setEditBody(review.content || review.body); // Fallback for Discussion (content) vs DiscussPost (body)
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editBody.trim()) {
      setEditError('Review content cannot be empty.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      const reviewIdStr = String(editReview._id || editReview.id);
      const res = await fetch(
        `${API_URL}/api/admin/reviews/${reviewIdStr}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({ body: editBody }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update review');
      }
      setEditReview(null);
      showToast('Review updated successfully');
      fetchReviews(selectedQuestionId);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Delete ───
  const openDeleteModal = (review) => {
    setDeleteTarget(review);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const reviewIdStr = String(deleteTarget._id || deleteTarget.id);
      const res = await fetch(
        `${API_URL}/api/admin/reviews/${reviewIdStr}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete review');
      }
      setDeleteTarget(null);
      showToast('Review deleted successfully');
      fetchReviews(selectedQuestionId);
      fetchQuestions();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Helpers ───
  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getDifficultyLabel = (diff) => {
    if (!diff) return 'UNKNOWN';
    const lower = diff.toLowerCase();
    if (lower === 'easy') return 'EASY';
    if (lower === 'medium') return 'MEDIUM';
    if (lower === 'hard' || lower === 'difficult') return 'DIFFICULT';
    return diff.toUpperCase();
  };

  const getDifficultyClass = (diff) => {
    if (!diff) return '';
    const lower = diff.toLowerCase();
    if (lower === 'easy') return 'easy';
    if (lower === 'medium') return 'medium';
    if (lower === 'hard' || lower === 'difficult') return 'hard';
    return '';
  };

  const getAuthorName = (author) => {
    if (!author) return 'Anonymous';
    if (typeof author === 'string') return author;
    return author.name || 'Anonymous';
  };

  const getAuthorAvatar = (author) => {
    if (!author) return 'U';
    if (typeof author === 'string') return author.charAt(0).toUpperCase();
    if (author.avatar) return <img src={author.avatar} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} />;
    return (author.name ? author.name.charAt(0).toUpperCase() : 'U');
  };

  // ─── Group Questions ───
  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const easyQuestions = filteredQuestions.filter(q => getDifficultyClass(q.difficulty) === 'easy');
  const mediumQuestions = filteredQuestions.filter(q => getDifficultyClass(q.difficulty) === 'medium');
  const hardQuestions = filteredQuestions.filter(q => getDifficultyClass(q.difficulty) === 'hard');

  return (
    <div style={{ width: '100%' }}>
      {/* Page header */}
      <div className="ap-page-header">
        <h1>Reviews</h1>
        <p>Manage and moderate reviews submitted for discussion questions.</p>
      </div>

      {/* Custom Dropdown */}
      <div className="ar-dropdown-container" ref={dropdownRef}>
        <div
          className={`ar-dropdown-trigger ${dropdownOpen ? 'open' : ''}`}
          onClick={() => {
            if (!loadingQuestions) setDropdownOpen(!dropdownOpen);
          }}
        >
          <span>
            {loadingQuestions
              ? 'Loading questions...'
              : selectedQuestion
              ? selectedQuestion.title
              : 'Select Question'}
          </span>
          <FiChevronDown size={18} />
        </div>

        {dropdownOpen && !loadingQuestions && (
          <div className="ar-dropdown-panel">
            <div className="ar-dropdown-search">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            {/* The dropdown list wrapper */}
            <div className="ar-dropdown-list">
              {filteredQuestions.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>
                  No questions found.
                </div>
              ) : (
                <div className="ar-dropdown-grid">
                  {/* EASY COLUMN */}
                  <div className="ar-col col-easy">
                    <div className="ar-col-title">EASY</div>
                    {easyQuestions.length === 0 && <span style={{fontSize:'0.8rem', color:'var(--ap-text-muted)', paddingLeft:'4px'}}>No easy questions match</span>}
                    {easyQuestions.map(q => (
                      <div
                        key={q.id || q._id}
                        className={`ar-q-item ${selectedQuestionId === (q.id || q._id) ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedQuestionId(q.id || q._id);
                          setDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="ar-diff-dot easy" />
                        <span className="ar-q-title">{q.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* MEDIUM COLUMN */}
                  <div className="ar-col col-medium">
                    <div className="ar-col-title">MEDIUM</div>
                    {mediumQuestions.length === 0 && <span style={{fontSize:'0.8rem', color:'var(--ap-text-muted)', paddingLeft:'4px'}}>No medium questions match</span>}
                    {mediumQuestions.map(q => (
                      <div
                        key={q.id || q._id}
                        className={`ar-q-item ${selectedQuestionId === (q.id || q._id) ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedQuestionId(q.id || q._id);
                          setDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="ar-diff-dot medium" />
                        <span className="ar-q-title">{q.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* HARD COLUMN */}
                  <div className="ar-col col-hard">
                    <div className="ar-col-title">DIFFICULT</div>
                    {hardQuestions.length === 0 && <span style={{fontSize:'0.8rem', color:'var(--ap-text-muted)', paddingLeft:'4px'}}>No difficult questions match</span>}
                    {hardQuestions.map(q => (
                      <div
                        key={q.id || q._id}
                        className={`ar-q-item ${selectedQuestionId === (q.id || q._id) ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedQuestionId(q.id || q._id);
                          setDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="ar-diff-dot hard" />
                        <span className="ar-q-title">{q.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {questionsError && (
        <div className="ap-error-msg">
          <FiAlertCircle size={16} /> {questionsError}
          <button className="ap-btn-ghost" onClick={fetchQuestions} style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {/* Selected Question */}
      {selectedQuestionId && !loadingReviews && selectedQuestion && (
        <div className="ar-selected-question" onClick={() => setQModalOpen(true)}>
          <div className="ar-sq-header">
            <span className={`ar-sq-badge ${getDifficultyClass(selectedQuestion.difficulty)}`}>
              {getDifficultyLabel(selectedQuestion.difficulty)}
            </span>
          </div>
          <h2 className="ar-sq-title">{selectedQuestion.title}</h2>
          
          <div style={{ marginTop: '12px' }}>
            {selectedQuestion.description ? (
              <div className="ar-sq-desc">{selectedQuestion.description}</div>
            ) : null}
            <div className="ar-sq-cta">
              View Question Details <FiArrowRight />
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      {!selectedQuestionId ? (
        <div className="ap-card" style={{ width: '100%' }}>
          <div className="ap-empty-state">
            <div className="ap-empty-icon">
              <FiSearch size={24} />
            </div>
            <h3>Select a question to manage its reviews</h3>
            <p>Choose a question from the dropdown above to moderate its discussions.</p>
          </div>
        </div>
      ) : loadingReviews ? (
        <div className="ap-card" style={{ width: '100%' }}>
          <div className="ap-loading">
            <div className="ap-spinner" />
            <span className="ap-loading-text">Loading reviews…</span>
          </div>
        </div>
      ) : reviewsError ? (
        <div className="ap-card" style={{ width: '100%' }}>
          <div className="ap-card-body">
            <div className="ap-error-msg">
              <FiAlertCircle size={16} /> {reviewsError}
              <button className="ap-btn-ghost" onClick={() => fetchReviews(selectedQuestionId)} style={{ marginLeft: 'auto' }}>
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Reviews list */
        <div className="ar-reviews-container">
          <div className="ar-reviews-header">
            <span className="ar-reviews-title">Reviews</span>
            <span className="ar-reviews-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>

          {reviews.length === 0 ? (
            <div className="ap-card">
              <div className="ap-empty-state">
                <div className="ap-empty-icon">
                  <FiAlertCircle size={24} />
                </div>
                <h3>No reviews yet</h3>
                <p>This question does not have any reviews.</p>
              </div>
            </div>
          ) : (
            reviews.map((review, idx) => (
              <div
                key={review._id || review.id}
                className={`ar-review-card rev-${getDifficultyClass(selectedQuestion.difficulty)}`}
                style={{ animationDelay: `${idx * 0.05}s`, animation: 'apFadeInUp 0.3s ease both' }}
              >
                <div className="ar-rc-header">
                  <div className="ar-rc-user">
                    <div className="ar-rc-avatar">
                      {getAuthorAvatar(review.author)}
                    </div>
                    <div className="ar-rc-meta">
                      <span className="ar-rc-name">{getAuthorName(review.author)}</span>
                      <span className="ar-rc-date">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="ar-rc-body">
                  {review.content || review.body}
                </div>

                <div className="ar-rc-actions">
                  <button
                    className="ar-btn-edit"
                    onClick={() => openEditModal(review)}
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button
                    className="ar-btn-delete"
                    onClick={() => openDeleteModal(review)}
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══ QUESTION DETAILS MODAL ═══ */}
      {qModalOpen && selectedQuestion && createPortal(
        <div
          className="ap-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setQModalOpen(false)}
        >
          <div className="ap-modal" style={{ maxWidth: '600px' }}>
            <div className="ap-modal-header" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--ap-border)' }}>
              <div>
                <h2>Question Details</h2>
              </div>
              <button
                className="ap-modal-close"
                onClick={() => setQModalOpen(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="ap-modal-body">
              <div style={{ marginBottom: '16px' }}>
                <span className={`ar-sq-badge ${getDifficultyClass(selectedQuestion.difficulty)}`}>
                  {getDifficultyLabel(selectedQuestion.difficulty)}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.4rem', marginTop: 0, marginBottom: '16px', color: 'var(--ap-text)' }}>
                {selectedQuestion.title}
              </h3>
              
              <div className="ar-qmodal-desc">
                {selectedQuestion.description}
              </div>

              {selectedQuestion.referenceImage && selectedQuestion.referenceImage !== '/images/references/placeholder.svg' && (
                <div className="ar-qmodal-img-wrap">
                  <img 
                    src={selectedQuestion.referenceImage} 
                    alt={selectedQuestion.title}
                    className="ar-qmodal-img" 
                  />
                </div>
              )}
            </div>

            <div className="ap-modal-footer">
              <button
                className="ap-btn-secondary"
                onClick={() => setQModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══ EDIT MODAL ═══ */}
      {editReview && createPortal(
        <div
          className="ap-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !editLoading && setEditReview(null)}
        >
          <div className="ap-modal">
            <div className="ap-modal-header">
              <div>
                <h2>Edit Review</h2>
                <p>Modify the review content</p>
              </div>
              <button
                className="ap-modal-close"
                onClick={() => !editLoading && setEditReview(null)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="ap-modal-body">
              {editError && (
                <div className="ap-error-msg">
                  <FiAlertCircle size={16} /> {editError}
                </div>
              )}

              <div className="ap-form-group" style={{ marginBottom: '16px' }}>
                <label className="ap-form-label">User</label>
                <input
                  type="text"
                  className="ap-form-input"
                  value={getAuthorName(editReview.author)}
                  disabled
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-form-label">
                  Review <span className="ap-required">*</span>
                </label>
                <textarea
                  className="ap-form-textarea"
                  rows={6}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Review content…"
                />
              </div>
            </div>

            <div className="ap-modal-footer">
              <button
                className="ap-btn-secondary"
                onClick={() => setEditReview(null)}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                className="ap-btn-primary"
                onClick={handleEditSave}
                disabled={editLoading}
              >
                <FiSave size={15} />
                {editLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══ DELETE MODAL ═══ */}
      {deleteTarget && createPortal(
        <div
          className="ap-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !deleteLoading && setDeleteTarget(null)}
        >
          <div className="ap-modal" style={{ maxWidth: '440px' }}>
            <div className="ap-modal-header">
              <div><h2>Delete Review?</h2></div>
              <button
                className="ap-modal-close"
                onClick={() => !deleteLoading && setDeleteTarget(null)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="ap-modal-body" style={{ textAlign: 'center' }}>
              <div className="ap-del-icon">
                <FiAlertCircle size={26} />
              </div>
              <p style={{
                color: 'var(--ap-text-sec)', fontSize: '0.95rem',
                margin: '16px 0 6px', lineHeight: 1.5
              }}>
                Are you sure you want to delete this review?
              </p>
              <p style={{
                color: 'var(--ap-text-muted)', fontSize: '0.85rem',
                margin: 0, lineHeight: 1.5
              }}>
                This action cannot be undone.
              </p>
              {deleteError && (
                <div className="ap-error-msg" style={{ textAlign: 'left', marginTop: '16px' }}>
                  <FiAlertCircle size={16} /> {deleteError}
                </div>
              )}
            </div>

            <div className="ap-modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="ap-btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="ap-btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.25)',
                }}
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                <FiTrash2 size={15} />
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className={`ar-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
