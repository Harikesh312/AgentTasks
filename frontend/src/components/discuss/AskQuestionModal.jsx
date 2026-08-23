import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import './AskQuestionModal.css';

export default function AskQuestionModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Question');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    
    try {
      await onSubmit({ title, content, type, tags });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit discussion.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="aq-modal-overlay" onClick={onClose}>
      <div className="aq-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="aq-modal-header">
          <h3>Start a Discussion</h3>
          <button className="aq-close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        
        <form className="aq-form" onSubmit={handleSubmit}>
          {error && <div className="aq-error">{error}</div>}
          
          <div className="aq-form-group">
            <label>Title <span className="required">*</span></label>
            <input 
              type="text" 
              placeholder="E.g., How to match the gradient exactly?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="aq-form-group">
            <label>Type <span className="required">*</span></label>
            <select value={type} onChange={(e) => setType(e.target.value)} disabled={isSubmitting}>
              <option value="Question">Question</option>
              <option value="Solution">Solution</option>
              <option value="Issue">Issue</option>
              <option value="Tip">Tip</option>
              <option value="Prompt">Prompt</option>
            </select>
          </div>

          <div className="aq-form-group">
            <label>Content <span className="required">*</span></label>
            <textarea 
              rows="6" 
              placeholder="Describe your issue, share your prompt, or explain your solution..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="aq-form-group">
            <label>Tags (optional, comma-separated)</label>
            <input 
              type="text" 
              placeholder="css, gradient, prompt"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="aq-form-footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
