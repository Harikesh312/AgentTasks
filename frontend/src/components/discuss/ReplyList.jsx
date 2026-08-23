import { FiCheckCircle, FiArrowUp } from 'react-icons/fi';
import { upvoteReply } from '../../api/discussApi';
import './ReplyList.css';

export default function ReplyList({ replies, currentUserId, isLoggedIn, discussionAuthorId, onAccept, onRefresh, memoryToken }) {
  
  const handleUpvote = async (replyId) => {
    if (!isLoggedIn) {
      alert('You must be logged in to upvote.');
      return;
    }
    try {
      await upvoteReply(replyId, memoryToken);
      onRefresh(); // Quick refresh for MVP
    } catch (err) {
      alert(err.message || 'Failed to upvote');
    }
  };

  if (!replies || replies.length === 0) {
    return (
      <div className="qd-replies-empty">
        <p>No replies yet. Be the first to answer!</p>
      </div>
    );
  }

  const isDiscussionAuthor = currentUserId && currentUserId === discussionAuthorId;

  return (
    <div className="qd-reply-list">
      {replies.map(reply => {
        const isUpvoted = reply.upvotes?.includes(currentUserId);
        
        return (
          <div key={reply._id} className={`qd-reply-card ${reply.isAccepted ? 'accepted' : ''}`}>
            {reply.isAccepted && (
              <div className="qd-reply-accepted-badge">
                <FiCheckCircle size={14} /> Accepted Answer
              </div>
            )}
            
            <div className="qd-reply-header">
              <div className="qd-detail-author">
                <div className="author-avatar">{reply.author?.name?.charAt(0).toUpperCase() || 'U'}</div>
                <span>{reply.author?.name || 'Unknown'}</span>
              </div>
              <span className="dc-dot">·</span>
              <span className="dc-time">{new Date(reply.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="qd-reply-content">
              <p>{reply.content}</p>
            </div>
            
            <div className="qd-reply-footer">
              <button 
                className={`qd-upvote-btn ${isUpvoted ? 'active' : ''}`} 
                onClick={() => handleUpvote(reply._id)}
              >
                <FiArrowUp size={14} /> {reply.upvotes?.length || 0}
              </button>

              {isDiscussionAuthor && (
                <button 
                  className={`qd-accept-btn ${reply.isAccepted ? 'active' : ''}`}
                  onClick={() => onAccept(reply._id)}
                >
                  <FiCheckCircle size={14} /> {reply.isAccepted ? 'Un-accept' : 'Accept as Answer'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
