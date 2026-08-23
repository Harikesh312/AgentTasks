import { FiMessageSquare, FiArrowUp, FiCheckCircle, FiAlertCircle, FiStar, FiFileText } from 'react-icons/fi';
import './DiscussionCard.css';

export default function DiscussionCard({ discussion, onClick }) {
  const getIcon = (type) => {
    switch (type) {
      case 'Solution': return <FiStar />;
      case 'Issue': return <FiAlertCircle />;
      case 'Prompt': return <FiStar />;
      case 'Tip': return <FiCheckCircle />;
      default: return <FiMessageSquare />;
    }
  };

  const typeClass = `type-${discussion.type.toLowerCase()}`;

  return (
    <div className={`discussion-card animate-fade-in-up ${typeClass}`} onClick={onClick}>
      <div className="dc-header">
        <div className="dc-type">
          <div className="icon-badge">
            {getIcon(discussion.type)}
          </div>
          <span className="dc-type-pill">{discussion.type}</span>
          {discussion.hasAcceptedAnswer && (
            <span className="dc-status-answered">
              <FiCheckCircle size={12} /> Answered
            </span>
          )}
        </div>
        <div className="dc-meta">
          <span className="dc-author">{discussion.author?.name || 'Unknown'}</span>
          <span className="dc-dot">·</span>
          <span className="dc-time">{new Date(discussion.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <h4 className="dc-title">{discussion.title}</h4>
      <p className="dc-preview">{discussion.content.substring(0, 150)}{discussion.content.length > 150 ? '...' : ''}</p>

      {discussion.tags && discussion.tags.length > 0 && (
        <div className="dc-tags">
          {discussion.tags.map(tag => (
            <span key={tag} className="dc-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="dc-footer">
        <div className="dc-stats">
          <span className="dc-stat">
            <FiArrowUp size={14} /> {discussion.upvotes?.length || 0}
          </span>
          <div className="dc-stat-divider" />
          <span className="dc-stat">
            <FiMessageSquare size={14} /> {discussion.repliesCount || 0} replies
          </span>
          <div className="dc-stat-divider" />
          <span className="dc-stat">
            <FiFileText size={14} /> {discussion.views || 0} views
          </span>
        </div>
      </div>
    </div>
  );
}
