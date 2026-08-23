import { useState } from 'react';
import { createReply } from '../../api/discussApi';
import { useAuth } from '../../context/AuthContext';
import './ReplyComposer.css';

export default function ReplyComposer({ discussionId, isLoggedIn, onReplyPosted }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { memoryToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isLoggedIn) {
      alert('You must be logged in to reply.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createReply(discussionId, content, memoryToken);
      setContent('');
      onReplyPosted();
    } catch (err) {
      setError(err.message || 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="reply-composer" onSubmit={handleSubmit}>
      {error && <div className="reply-error">{error}</div>}
      <textarea
        className="reply-textarea"
        placeholder={isLoggedIn ? 'Write a reply...' : 'Log in to reply'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!isLoggedIn || isSubmitting}
        rows={3}
      />
      <div className="reply-composer-footer">
        <button
          type="submit"
          className="btn-primary btn-sm"
          disabled={!isLoggedIn || !content.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Reply'}
        </button>
      </div>
    </form>
  );
}
