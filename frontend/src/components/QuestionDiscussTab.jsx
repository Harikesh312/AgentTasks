import { useState, useMemo } from 'react';
import { FiMessageSquare, FiThumbsUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { discussPosts } from '../data/discuss';
import './QuestionDiscussTab.css';

export default function QuestionDiscussTab({ questionId, onTryPrompt }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Best');

  // Filter posts to only those belonging to this question
  const questionPosts = useMemo(() => {
    return discussPosts.filter(p => p.questionId === questionId);
  }, [questionId]);

  const filteredAndSortedPosts = useMemo(() => {
    let list = [...questionPosts];

    if (activeFilter === 'Prompt Shares') {
      list = list.filter(p => p.type === 'prompt-share');
    } else if (activeFilter === 'Questions') {
      list = list.filter(p => p.type === 'question');
    } else if (activeFilter === 'Trap Breakdowns') {
      list = list.filter(p => p.type === 'trap-breakdown');
    }

    if (sortBy === 'Most Recent') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'Best') {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === 'Fewest Turns Used') {
      list.sort((a, b) => {
        if (!a.turnsUsed) return 1;
        if (!b.turnsUsed) return -1;
        return a.turnsUsed - b.turnsUsed;
      });
    } else if (sortBy === 'Highest Score') {
      list.sort((a, b) => {
        if (!a.scoreAchieved) return 1;
        if (!b.scoreAchieved) return -1;
        return b.scoreAchieved - a.scoreAchieved;
      });
    }

    return list;
  }, [questionPosts, activeFilter, sortBy]);

  const handleUpvote = (e) => {
    e.stopPropagation();
    alert('Upvoted in local session (demo)');
  };

  const getPostIcon = (type) => {
    if (type === 'prompt-share') return <FiCheckCircle className="icon-success" />;
    if (type === 'trap-breakdown') return <FiAlertTriangle className="icon-warning" />;
    return <FiMessageSquare className="icon-info" />;
  };

  if (questionPosts.length === 0) {
    return (
      <div className="qd-discuss-empty animate-fade">
        <FiMessageSquare size={40} className="empty-icon" />
        <p>No discussions yet — be the first to share the prompt that worked for you.</p>
      </div>
    );
  }

  return (
    <div className="qd-discuss-tab animate-fade">
      <div className="qd-discuss-controls">
        <div className="qd-filters">
          {['All', 'Prompt Shares', 'Questions', 'Trap Breakdowns'].map(filter => (
            <button 
              key={filter}
              className={`qd-filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <select 
          className="qd-sort-select"
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Best">Best</option>
          <option value="Most Recent">Most Recent</option>
          <option value="Fewest Turns Used">Fewest Turns Used</option>
          <option value="Highest Score">Highest Score</option>
        </select>
      </div>

      <div className="qd-discuss-list">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="qd-discuss-empty-filter">No posts match this filter.</div>
        ) : (
          filteredAndSortedPosts.map(post => (
            <div key={post.id} className="qd-discuss-card">
              <div className="qd-dc-header">
                <div className="qd-dc-meta">
                  {getPostIcon(post.type)}
                  <span className="qd-dc-author">{post.author}</span>
                  {post.authorBadge && <span className="author-badge">{post.authorBadge}</span>}
                </div>
                <div className="qd-dc-stats">
                  {post.turnsUsed && <span className="qd-stat-pill">Turns: {post.turnsUsed}</span>}
                  {post.scoreAchieved && <span className="qd-stat-pill score">Score: {post.scoreAchieved}</span>}
                </div>
              </div>
              
              <h4 className="qd-dc-title">{post.title}</h4>
              <p className="qd-dc-body">{post.body}</p>

              {post.type === 'prompt-share' && post.promptText && (
                <div className="qd-dc-prompt">
                  <pre>{post.promptText}</pre>
                  <button className="btn-outline btn-sm qd-try-btn" onClick={() => onTryPrompt(post.promptText)}>
                    Try this prompt
                  </button>
                </div>
              )}

              <div className="qd-dc-footer">
                <button className="qd-action-btn" onClick={handleUpvote}>
                  <FiThumbsUp size={14} /> {post.upvotes}
                </button>
                <span className="qd-comment-count">
                  <FiMessageSquare size={14} /> {post.commentCount} comments
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
