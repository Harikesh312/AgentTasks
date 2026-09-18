import { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiArrowRight, FiCheckCircle, FiAlertTriangle, FiTarget, FiBox } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import FilterBar from '../components/FilterBar';
import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../context/AuthContext';
import './QuestionsPage.css';

export default function QuestionsPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('All Problems');
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { completedQuestions, memoryToken } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const headers = {};
        if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;
        
        const res = await fetch(`${API_URL}/api/questions`, { headers, credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch questions');
        
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
        // Optional fallback to local data if needed, but for now we'll just show error
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [memoryToken]);
  
  const handleFilter = (filters) => {
    setSearch(filters.search);
    setDifficulty(filters.difficulty);
    setCategory(filters.category);
  };

  // Stats calculation
  const totalQuestions = questions.length;
  const completedCount = completedQuestions.length;
  const completionPercentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
  const trapCount = questions.filter(q => q.isOptimizationTrap).length;

  // Find last unfinished question
  const lastUnfinished = useMemo(() => {
    if (!questions || questions.length === 0) return null;
    return questions.find(q => !completedQuestions.includes(q.id)) || questions[0];
  }, [questions, completedQuestions]);

  // Tab filtering
  const displayQuestions = useMemo(() => {
    let result = questions;
    
    // Tab filters
    if (activeTab === 'In Progress') {
      result = result.filter(q => !completedQuestions.includes(q.id));
    } else if (activeTab === 'Completed') {
      result = result.filter(q => completedQuestions.includes(q.id));
    }
    // Note: 'Saved' is a placeholder tab for UI completeness unless we have saved logic

    // Standard filters
    if (search) {
      result = result.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (difficulty !== 'All') {
      result = result.filter((q) => q.difficulty === difficulty);
    }
    if (category !== 'All') {
      result = result.filter((q) => q.category === category);
    }
    
    return result;
  }, [search, difficulty, category, activeTab, completedQuestions, questions]);
    
  if (loading) {
    return (
      <div className="questions-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading problems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questions-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ color: 'var(--error)' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="questions-page" id="questions-page">
      <div className="page-watermark"></div>
      
      {/* PREMIUM HEADER */}
      <div className="premium-q-header">
        <div className="premium-q-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Problems</h1>
            <p className="page-subtitle">
              Practice guiding AI agents to build real UIs. Write prompts, not code.
            </p>
          </div>
          
          <div className="header-stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper neutral"><FiBox size={28} strokeWidth={2.5} /></div>
              <div className="stat-info">
                <span className="stat-value">{totalQuestions}</span>
                <span className="stat-label">Total Problems</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper success"><FiCheckCircle size={28} strokeWidth={2.5} /></div>
              <div className="stat-info">
                <span className="stat-value">{completedCount}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper warning"><FiAlertTriangle size={28} strokeWidth={2.5} /></div>
              <div className="stat-info">
                <span className="stat-value">{trapCount}</span>
                <span className="stat-label">Optimization Traps</span>
              </div>
            </div>
          </div>

          <div className="header-progress-section">
            <div className="progress-text-row">
              <span className="progress-label">Completion Progress</span>
              <span className="progress-count">{completedCount} of {totalQuestions} completed ({completionPercentage}%)</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="header-right-panel">
          {/* Continue Practice Card */}
          {lastUnfinished && (
            <div className="continue-card">
              <div className="continue-header">
                <span className="continue-badge">UP NEXT</span>
              </div>
              <h3 className="continue-title">{lastUnfinished.title}</h3>
              <div className="continue-meta">
                <span className={`badge badge-${lastUnfinished.difficulty.toLowerCase()}`}>{lastUnfinished.difficulty}</span>
                <span className="category-tag small">{lastUnfinished.category}</span>
              </div>
              <Link to={`/questions/${lastUnfinished.id}`} className="btn-resume">
                Resume Practice <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="q-tabs-row">
        {['All Problems', 'In Progress', 'Completed', 'Saved'].map(tab => (
          <button 
            key={tab} 
            className={`q-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <FilterBar onFilter={handleFilter} />
      
      <div className="questions-table">
        <div className="table-header">
          <span className="th-status">Status</span>
          <span className="th-thumb">Target</span>
          <span className="th-title">Title</span>
          <span className="th-diff">Difficulty</span>
          <span className="th-cat">Category</span>
          <span className="th-attempts">Avg Turns</span>
        </div>
        <div className="table-body">
          {displayQuestions.length === 0 ? (
            <div className="no-results">
              <FiSearch size={32} />
              <p>No questions match your filters</p>
            </div>
          ) : (
            displayQuestions.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
