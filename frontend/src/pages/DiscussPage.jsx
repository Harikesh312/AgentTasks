import { useState, useMemo } from 'react';
import {
  FiMessageSquare,
  FiSearch,
  FiPlus,
  FiThumbsUp,
  FiFlag,
  FiUser,
  FiClock,
  FiArrowRight,
  FiChevronDown,
  FiHash,
  FiCornerDownRight,
  FiX,
  FiBox,
  FiTarget,
  FiUsers
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { discussPosts as initialPosts, discussCategories } from '../data/discuss';
import userProfile from '../data/userProfile';
import './DiscussPage.css';

/* ─── Helpers ─── */
const formatDate = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return `1 day ago`;
  return `${days}d ago`;
};

const getCategoryBadge = (category) => {
  const map = {
    'Interview Experience': 'cat-interview',
    'Prompt Strategies': 'cat-strategy',
    'Optimization': 'cat-optimization',
    'Career & AI': 'cat-career',
    'Feedback': 'cat-feedback'
  };
  return map[category] || 'cat-default';
};

/* ─────────────────────────────────────────── */
/*  DiscussPage                                */
/* ─────────────────────────────────────────── */
export default function DiscussPage() {
  const navigate = useNavigate();

  // State
  const [posts, setPosts] = useState(initialPosts);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Most Recent');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activePostId, setActivePostId] = useState(null);

  // New Post State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Prompt Strategies');
  const [newPostBody, setNewPostBody] = useState('');
  const [newPostQuestionId, setNewPostQuestionId] = useState('');

  // Derived state
  const activePost = activePostId ? posts.find(p => p.id === activePostId) : null;

  // Filter & Sort
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (activeTab !== 'All') {
      list = list.filter(p => p.category === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.body || '').toLowerCase().includes(q) ||
        (p.author || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'Most Recent') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'Best') {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === 'Most Commented') {
      list.sort((a, b) => b.commentCount - a.commentCount);
    }

    return list;
  }, [posts, activeTab, search, sortBy]);

  // Actions
  const handlePublish = () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return;

    const newPost = {
      id: Date.now(),
      type: "question",
      questionId: newPostQuestionId ? Number(newPostQuestionId) : null,
      title: newPostTitle,
      category: newPostCategory,
      author: userProfile.displayName,
      authorBadge: userProfile.badges?.[0]?.name || null,
      authorAvatar: userProfile.avatar,
      body: newPostBody,
      promptText: null,
      turnsUsed: null,
      scoreAchieved: null,
      upvotes: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      comments: []
    };

    setPosts([newPost, ...posts]);
    setIsComposerOpen(false);
    setNewPostTitle('');
    setNewPostBody('');
    setNewPostQuestionId('');
    setActiveTab('All');
    setSortBy('Most Recent');
  };

  const toggleUpvote = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, upvotes: p.upvotes + 1 };
      }
      return p;
    }));
  };

  const handleReport = () => {
    alert('Report submitted. Thank you for keeping the community safe.');
  };

  // Render Thread View
  if (activePost) {
    return (
      <div className="discuss-page thread-view" id="discuss-page">
        <div className="thread-header">
          <button className="btn-outline btn-sm" onClick={() => setActivePostId(null)}>
            &larr; Back to Discuss
          </button>
        </div>

        <div className="thread-main animate-fade">
          <div className="thread-post-card">
            <div className="thread-post-meta">
              <img src={activePost.authorAvatar} alt={activePost.author} className="author-avatar" />
              <div className="author-info">
                <span className="author-name">{activePost.author}</span>
                {activePost.authorBadge && <span className="author-badge">{activePost.authorBadge}</span>}
              </div>
              <span className="post-time"><FiClock size={18} /> {formatDate(activePost.createdAt)}</span>
            </div>

            <h1 className="thread-title">{activePost.title}</h1>
            <span className={`post-category-tag ${getCategoryBadge(activePost.category)}`}>
              {activePost.category}
            </span>

            {activePost.type === 'prompt-share' && activePost.promptText && (
              <div className="thread-prompt-share">
                <div className="prompt-share-header">
                  <strong><FiMessageSquare size={18} /> Prompt Share</strong>
                  {activePost.turnsUsed && <span className="prompt-stat">Solved in {activePost.turnsUsed} turn{activePost.turnsUsed > 1 ? 's' : ''}</span>}
                  {activePost.scoreAchieved && <span className="prompt-stat highlight">Score: {activePost.scoreAchieved}</span>}
                </div>
                <pre className="prompt-code-block">{activePost.promptText}</pre>

                <button
                  className="btn-primary"
                  onClick={() => navigate(activePost.questionId ? `/questions/${activePost.questionId}` : '/questions')}
                >
                  Try this prompt <FiArrowRight size={18} />
                </button>
              </div>
            )}

            <div className="thread-body">
              {activePost.body.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="thread-actions">
              <button className="action-btn" onClick={() => toggleUpvote(activePost.id)}>
                <FiThumbsUp size={20} /> {activePost.upvotes}
              </button>
              <button className="action-btn" onClick={handleReport}>
                <FiFlag size={18} /> Report
              </button>
            </div>
          </div>

          <h3 className="comments-heading">Comments ({activePost.comments.length})</h3>

          <div className="comments-list">
            {activePost.comments.map(comment => (
              <div key={comment.id} className="comment-card animate-fade">
                <div className="comment-meta">
                  <img src={comment.authorAvatar} alt={comment.author} className="author-avatar sm" />
                  <span className="author-name">{comment.author}</span>
                  {comment.authorBadge && <span className="author-badge">{comment.authorBadge}</span>}
                  <span className="post-time">{formatDate(comment.createdAt)}</span>
                </div>
                <div className="comment-body">
                  {comment.body}
                </div>
                <div className="comment-actions">
                  <button className="action-btn sm" onClick={() => alert('Comment upvoted')}>
                    <FiThumbsUp size={18} /> {comment.upvotes}
                  </button>
                  <button className="action-btn sm" onClick={handleReport}>
                    <FiFlag size={18} /> Report
                  </button>
                </div>
              </div>
            ))}

            {activePost.comments.length === 0 && (
              <div className="empty-comments">
                <FiMessageSquare size={24} />
                <p>No comments yet. Be the first to reply!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Main View
  return (
    <div className="discuss-page" id="discuss-page">
      {/* ─── Hero ─── */}
      <section className="discuss-hero">
        <div className="discuss-hero-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="discuss-hero-inner animate-slide">
          <div className="discuss-hero-text">
            <h1 className="discuss-hero-title">Discuss</h1>
            <p className="discuss-hero-sub">
              Learn from real prompts, interview experiences, agent failures, and strategies shared by the AgentPrep community.
            </p>
            <div className="discuss-stats">
              <div className="d-stat stat-orange">
                <div className="d-stat-icon"><FiMessageSquare size={24} /></div>
                <div className="d-stat-info"><strong>1,248</strong> <span>Community Discussions</span></div>
              </div>
              <div className="d-stat stat-purple">
                <div className="d-stat-icon"><FiBox size={24} /></div>
                <div className="d-stat-info"><strong>486</strong> <span>Prompt Shares</span></div>
              </div>
              <div className="d-stat stat-blue">
                <div className="d-stat-icon"><FiTarget size={24} /></div>
                <div className="d-stat-info"><strong>214</strong> <span>Interview Experiences</span></div>
              </div>
              <div className="d-stat stat-green">
                <div className="d-stat-icon"><FiUsers size={24} /></div>
                <div className="d-stat-info"><strong>832</strong> <span>Active Contributors</span></div>
              </div>
            </div>
          </div>
          <div className="discuss-hero-visual">
            <img
              src="/discuss_hero.jpg"
              alt="AI Developer Community"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </section>

      <div className="discuss-content">
        {/* ─── Controls ─── */}
        <div className="discuss-toolbar">
          <div className="discuss-search">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="discuss-actions">
            <div className="sort-dropdown">
              <FiChevronDown size={18} className="sort-icon" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="Most Recent">Most Recent</option>
                <option value="Best">Best</option>
                <option value="Most Commented">Most Commented</option>
              </select>
            </div>

            <button className="btn-primary" onClick={() => setIsComposerOpen(!isComposerOpen)}>
              <FiPlus size={20} /> New Post
            </button>
          </div>
        </div>

        <div className="discuss-filters">
          {discussCategories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ─── Composer ─── */}
        {isComposerOpen && (
          <div className="composer-card animate-slide">
            <div className="composer-header">
              <h3>Create New Discussion</h3>
              <button className="close-btn" onClick={() => setIsComposerOpen(false)}><FiX /></button>
            </div>
            <div className="composer-body">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="What do you want to discuss?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="composer-input title"
                />
              </div>
              <div className="composer-row">
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="composer-select"
                >
                  {discussCategories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Optional Question ID (e.g. 1)"
                  value={newPostQuestionId}
                  onChange={(e) => setNewPostQuestionId(e.target.value)}
                  className="composer-input q-id"
                />
              </div>
              <textarea
                placeholder="Share your experience, strategy, prompt, or question... (Markdown supported)"
                value={newPostBody}
                onChange={(e) => setNewPostBody(e.target.value)}
                className="composer-textarea"
                rows={5}
              />
              <div className="composer-footer">
                <button className="btn-primary" onClick={handlePublish}>Publish Discussion</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Posts List ─── */}
        <div className="posts-list">
          {filteredPosts.length === 0 ? (
            <div className="discuss-empty animate-fade">
              <FiSearch size={48} />
              <h3>No discussions found</h3>
              <p>Try adjusting your search or category filters.</p>
            </div>
          ) : (
            filteredPosts.map((post, idx) => (
              <div
                key={post.id}
                className="post-card animate-fade"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => setActivePostId(post.id)}
              >
                <div className="post-main">
                  <div className="post-meta">
                    <img src={post.authorAvatar} alt={post.author} className="author-avatar sm" />
                    <span className="author-name">{post.author}</span>
                    {post.authorBadge && <span className="author-badge">{post.authorBadge}</span>}
                    <span className="post-dot">&middot;</span>
                    <span className="post-time">{formatDate(post.createdAt)}</span>
                  </div>

                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-preview">
                    {post.body.substring(0, 150)}{post.body.length > 150 ? '...' : ''}
                  </p>

                  <div className="post-footer-meta">
                    <span className={`post-category-tag ${getCategoryBadge(post.category)}`}>
                      {post.category}
                    </span>
                    {post.questionId && (
                      <span className="post-q-link">
                        <FiHash size={18} /> Question {post.questionId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="post-stats">
                  <div className="stat-item" onClick={(e) => { e.stopPropagation(); toggleUpvote(post.id); }}>
                    <FiThumbsUp size={20} />
                    <span>{post.upvotes}</span>
                  </div>
                  <div className="stat-item">
                    <FiMessageSquare size={20} />
                    <span>{post.commentCount}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
