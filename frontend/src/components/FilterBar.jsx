import { useState, useMemo } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './FilterBar.css';

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
const types = [
  { id: 'All', label: 'All' },
  { id: 'ui-generation', label: 'UI Generation' },
  { id: 'debugging', label: 'Debugging' },
  { id: 'testing', label: 'Testing' },
  { id: 'optimization', label: 'Optimization' },
  { id: 'code-review', label: 'Code Review' },
  { id: 'system-scaling', label: 'System Scaling' },
];
const categories = ['All', 'UI Cloning', 'Landing Page', 'Dashboard', 'Component', 'Optimization Challenge'];

export default function FilterBar({ onFilter }) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [questionType, setQuestionType] = useState('All');

  const handleChange = (filterType, value) => {
    const newState = { search, difficulty, category, questionType };
    if (filterType === 'search') { newState.search = value; setSearch(value); }
    if (filterType === 'difficulty') { newState.difficulty = value; setDifficulty(value); }
    if (filterType === 'category') { newState.category = value; setCategory(value); }
    if (filterType === 'questionType') { newState.questionType = value; setQuestionType(value); }
    onFilter(newState);
  };

  const handleClear = () => {
    setSearch('');
    setDifficulty('All');
    setCategory('All');
    setQuestionType('All');
    onFilter({ search: '', difficulty: 'All', category: 'All', questionType: 'All' });
  };

  const hasActiveFilters = search !== '' || difficulty !== 'All' || category !== 'All' || questionType !== 'All';

  return (
    <div className="filter-bar" id="filter-bar">
      <div className="filter-header">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="search-input"
            id="search-input"
          />
        </div>
        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={handleClear}>
            <FiX size={14} /> Clear Filters
          </button>
        )}
      </div>
      
      <div className="filter-chips-row">
        <div className="filter-group">
          <span className="filter-label">Type</span>
          <div className="chips">
            {types.map((t) => (
              <button
                key={t.id}
                className={`chip ${questionType === t.id ? 'active' : ''}`}
                onClick={() => handleChange('questionType', t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Difficulty</span>
          <div className="chips">
            {difficulties.map((d) => (
              <button
                key={d}
                className={`chip ${difficulty === d ? 'active' : ''} ${d !== 'All' ? `chip-${d.toLowerCase()}` : ''}`}
                onClick={() => handleChange('difficulty', d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Category</span>
          <div className="chips">
            {categories.map((c) => (
              <button
                key={c}
                className={`chip ${category === c ? 'active' : ''}`}
                onClick={() => handleChange('category', c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
