import { useState, useEffect } from 'react';
import { getDiscussionDetails, upvoteDiscussion, acceptReply } from '../../api/discussApi';
import ReplyComposer from './ReplyComposer';
import ReplyList from './ReplyList';
import { FiArrowLeft, FiArrowUp, FiCheckCircle, FiAlertCircle, FiStar, FiFileText } from 'react-icons/fi';
import './DiscussionDetail.css';

export default function DiscussionDetail({ discussionId, onBack, isLoggedIn, currentUserId, memoryToken }) {
  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [discussionId]);

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDiscussionDetails(discussionId, memoryToken);
      setDiscussion(data.discussion);
      setReplies(data.replies);
    } catch (err) {
      setError(err.message || 'Failed to load discussion details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!isLoggedIn) {
      alert('You must be logged in to upvote.');
      return;
    }
    try {
      const data = await upvoteDiscussion(discussionId, memoryToken);
      setDiscussion(prev => ({ ...prev, upvotes: data.upvotes }));
    } catch (err) {
      alert(err.message || 'Failed to upvote');
    }
  };

  const handleAcceptReply = async (replyId) => {
    try {
      await acceptReply(replyId, memoryToken);
      fetchDetails(); // Refresh to get updated accepted status
    } catch (err) {
      alert(err.message || 'Failed to accept answer');
    }
  };

  if (isLoading) {
    return (
      <div className="qd-detail-container">
        <button className="btn-back" onClick={onBack}>
          <FiArrowLeft /> Back to Discussions
        </button>
        <div className="qd-discuss-skeleton" style={{ marginTop: '20px' }}>
          <div className="skeleton-card" style={{ height: '200px' }}></div>
          <div className="skeleton-card" style={{ height: '100px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="qd-detail-container">
        <button className="btn-back" onClick={onBack}>
          <FiArrowLeft /> Back to Discussions
        </button>
        <div className="qd-discuss-error" style={{ marginTop: '20px' }}>
          <p>{error || 'Discussion not found'}</p>
        </div>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'Solution': return <FiStar className="type-icon type-solution" />;
      case 'Issue': return <FiAlertCircle className="type-icon type-issue" />;
      case 'Prompt': return <FiStar className="type-icon type-prompt" />;
      case 'Tip': return <FiCheckCircle className="type-icon type-tip" />;
      default: return <FiStar className="type-icon type-question" />;
    }
  };

  const isUpvoted = discussion.upvotes?.includes(currentUserId);
  const isAuthor = discussion.author?._id === currentUserId;

  return (
    <div className="qd-detail-container animate-fade">
      <button className="btn-back" onClick={onBack}>
        <FiArrowLeft /> Back to Discussions
      </button>

      <div className="qd-detail-main">
        <div className="qd-detail-header">
          <div className="qd-detail-meta-top">
            <div className="dc-type">
              {getIcon(discussion.type)}
              <span className="dc-type-label">{discussion.type}</span>
            </div>
            {discussion.hasAcceptedAnswer && (
              <span className="dc-status-answered">
                <FiCheckCircle size={12} /> Answered
              </span>
            )}
          </div>
          <h2 className="qd-detail-title">{discussion.title}</h2>
          <div className="qd-detail-meta">
            <div className="qd-detail-author">
              <div className="author-avatar">{discussion.author?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <span>{discussion.author?.name || 'Unknown'}</span>
            </div>
            <span className="dc-dot">·</span>
            <span className="dc-time">{new Date(discussion.createdAt).toLocaleString()}</span>
            <span className="dc-dot">·</span>
            <span className="qd-detail-views"><FiFileText size={12} /> {discussion.views} views</span>
          </div>
        </div>

        <div className="qd-detail-content">
          <p>{discussion.content}</p>
        </div>

        {discussion.tags && discussion.tags.length > 0 && (
          <div className="dc-tags qd-detail-tags">
            {discussion.tags.map(tag => (
              <span key={tag} className="dc-tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="qd-detail-footer">
          <button 
            className={`qd-upvote-btn ${isUpvoted ? 'active' : ''}`} 
            onClick={handleUpvote}
          >
            <FiArrowUp size={16} /> {discussion.upvotes?.length || 0}
          </button>
        </div>
      </div>

      <div className="qd-detail-replies-section">
        <h3>Replies ({discussion.repliesCount || 0})</h3>
        
        <ReplyList 
          replies={replies} 
          currentUserId={currentUserId}
          isLoggedIn={isLoggedIn}
          discussionAuthorId={discussion.author?._id}
          onAccept={handleAcceptReply}
          onRefresh={fetchDetails}
          memoryToken={memoryToken}
        />

        <ReplyComposer 
          discussionId={discussion._id} 
          isLoggedIn={isLoggedIn} 
          onReplyPosted={fetchDetails} 
        />
      </div>
    </div>
  );
}
