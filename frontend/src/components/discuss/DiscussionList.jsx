import { useState, useEffect } from 'react';
import { getDiscussions } from '../../api/discussApi';
import DiscussionFilters from './DiscussionFilters';
import DiscussionCard from './DiscussionCard';
import AskQuestionModal from './AskQuestionModal';
import { FiMessageSquare } from 'react-icons/fi';
import './DiscussionList.css';

export default function DiscussionList({ problemId, onSelectDiscussion, onCreateDiscussion, isLoggedIn }) {
  const [discussions, setDiscussions] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showAskModal, setShowAskModal] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [problemId, activeFilter, sortBy]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDiscussions();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchDiscussions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeFilter !== 'All') {
        if (activeFilter === 'Questions') params.type = 'Question';
        else if (activeFilter === 'Solutions') params.type = 'Solution';
        else if (activeFilter === 'Issues') params.type = 'Issue';
        else if (activeFilter === 'Tips') params.type = 'Tip';
        else if (activeFilter === 'Prompts') params.type = 'Prompt';
      }
      if (sortBy) params.sort = sortBy;
      if (searchQuery) params.search = searchQuery;

      const data = await getDiscussions(problemId, params);
      setDiscussions(data.discussions || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestionClick = () => {
    if (!isLoggedIn) {
      alert('You must be logged in to start a discussion.');
      return;
    }
    setShowAskModal(true);
  };

  const handleCreateDiscussion = async (data) => {
    await onCreateDiscussion(data);
    fetchDiscussions();
  };

  return (
    <div className="qd-discuss-list-container animate-fade">
      <div className="qd-discuss-header">
        <div>
          <h2>💬 Discuss</h2>
          <p className="qd-discuss-subtitle">Ask questions, share solutions and help others.</p>
        </div>
        <div className="qd-discuss-actions">
          <span className="qd-discuss-count">{total} discussion{total !== 1 ? 's' : ''}</span>
          <button className="btn-primary btn-sm" onClick={handleAskQuestionClick}>
            + Ask a Question
          </button>
        </div>
      </div>

      <DiscussionFilters 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="qd-discuss-items">
        {isLoading ? (
          <div className="qd-discuss-skeleton">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : error ? (
          <div className="qd-discuss-error">
            <p>{error}</p>
            <button className="btn-outline btn-sm" onClick={fetchDiscussions}>Try Again</button>
          </div>
        ) : discussions.length === 0 ? (
          <div className="qd-discuss-empty">
            <FiMessageSquare size={48} className="empty-icon" />
            <h3 className="empty-title">Start the conversation</h3>
            <p className="empty-hint">No discussions yet for this problem. Ask a question, share a solution, or post a prompt that worked for you.</p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={handleAskQuestionClick}>
              + Ask a Question
            </button>
          </div>
        ) : (
          discussions.map(discussion => (
            <DiscussionCard 
              key={discussion._id} 
              discussion={discussion} 
              onClick={() => onSelectDiscussion(discussion._id)} 
            />
          ))
        )}
      </div>

      {showAskModal && (
        <AskQuestionModal 
          onClose={() => setShowAskModal(false)}
          onSubmit={handleCreateDiscussion}
        />
      )}
    </div>
  );
}
