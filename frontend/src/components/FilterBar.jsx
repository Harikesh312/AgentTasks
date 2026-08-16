import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import './FilterBar.css';

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
const categories = ['All', 'UI Cloning', 'Landing Page', 'Dashboard', 'Component', 'Optimization Challenge'];

export default function FilterBar({ onFilter }) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');

  const handleChange = (type, value) => {
    const newState = { search, difficulty, category };
    if (type === 'search') { newState.search = value; setSearch(value); }
    if (type === 'difficulty') { newState.difficulty = value; setDifficulty(value); }
    if (type === 'category') { newState.category = value; setCategory(value); }
    onFilter(newState);
  };

  return (
    <div className="filter-bar" id="filter-bar">
      <div className="search-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="search-input"
          id="search-input"
        />
      </div>
      <div className="filter-chips-row">
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
