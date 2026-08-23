import { FiSearch } from 'react-icons/fi';
import './DiscussionFilters.css';

export default function DiscussionFilters({ 
  activeFilter, 
  setActiveFilter, 
  sortBy, 
  setSortBy, 
  searchQuery, 
  setSearchQuery 
}) {
  const filters = ['All', 'Questions', 'Solutions', 'Issues', 'Tips', 'Prompts'];
  
  return (
    <div className="qd-filters-container">
      <div className="qd-filters-top">
        <div className="qd-filters-scroll">
          {filters.map(filter => (
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
          <option value="Popular">Popular</option>
          <option value="Recent">Recent</option>
          <option value="Most Helpful">Most Helpful</option>
          <option value="Unanswered">Unanswered</option>
        </select>
      </div>
      <div className="qd-search-bar">
        <FiSearch className="qd-search-icon" />
        <input 
          type="text" 
          placeholder="Search discussions..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="qd-search-input"
        />
      </div>
    </div>
  );
}
